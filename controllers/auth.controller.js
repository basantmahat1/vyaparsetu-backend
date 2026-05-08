const { User, Business } = require('../models');
const { generateToken } = require('../utils/jwt');
const { sendResponse, sendError } = require('../utils/response');
const { Op } = require('sequelize');

const register = async (req, res) => {
  try {
    const { name, email, password, role, businessName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 400, 'User already exists');
    }

    let businessId = null;
    let userRole = role || 'owner';

    // Only allow owner registration for now
    if (userRole !== 'owner') {
      return sendError(res, 400, 'Only business owners can register at this time. Staff accounts must be created by business owners.');
    }

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      businessId: null // Will update after business creation for owners
    });

    // If role is owner, create a business
    if (userRole === 'owner') {
      if (!businessName) {
        return sendError(res, 400, 'Business name is required for owner registration');
      }

      const business = await Business.create({
        name: businessName,
        ownerId: user.id,
        plan: 'basic'
      });
      businessId = business.id;

      // Update user with businessId
      await user.update({ businessId });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    sendResponse(res, 201, true, 'Registration successful', {
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 500, 'Registration failed', error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Business,
        as: 'business',
        required: false
      }]
    });

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    sendResponse(res, 200, true, 'Login successful', {
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Login failed', error);
  }
};

const logout = async (req, res) => {
  try {
    // Since we're using stateless JWT, just send success
    sendResponse(res, 200, true, 'Logout successful');
  } catch (error) {
    sendError(res, 500, 'Logout failed', error);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Business,
        as: 'business',
        required: false
      }]
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'User retrieved', user);
  } catch (error) {
    sendError(res, 500, 'Failed to get user', error);
  }
};

module.exports = { register, login, logout, getMe };