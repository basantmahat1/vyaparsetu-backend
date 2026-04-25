const { sendError } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return sendError(res, 400, 'Validation error', { messages });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 400, 'Duplicate entry error', err);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  // Default error
  sendError(res, err.status || 500, err.message || 'Internal server error');
};

module.exports = errorMiddleware;