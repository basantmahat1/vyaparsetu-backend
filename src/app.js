const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('../middlewares/error.middleware');

const authRoutes = require('../routes/auth.routes');
const productRoutes = require('../routes/product.routes');
const saleRoutes = require('../routes/sale.routes');
const businessRoutes = require('../routes/business.routes');
const dashboardRoutes = require('../routes/dashboard.routes');
const superAdminRoutes = require('../routes/superadmin');
const staffRoutes = require('../routes/staff.routes');
const themeRoutes = require('../routes/theme.routes');

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
         ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/theme', themeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

app.use(errorMiddleware);

module.exports = app;
