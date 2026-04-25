const { User } = require('./models');
const { sequelize } = require('./config/db');

const createSuperAdmin = async () => {
  try {
    // Sync database
    await sequelize.sync();

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ where: { role: 'super_admin' } });
    if (existingSuperAdmin) {
      // Update the password
      await existingSuperAdmin.update({ password: 'superadmin123' });
      console.log('Super admin password updated');
    } else {
      // Create super admin
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@dukaan.com',
        password: 'superadmin123', // Don't hash here, the hook will do it
        role: 'super_admin',
        businessId: null,
        isActive: true
      });

      console.log('Super admin created successfully');
    }
    console.log('Email: superadmin@dukaan.com');
    console.log('Password: superadmin123');
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await sequelize.close();
  }
};

createSuperAdmin();