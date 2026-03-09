const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

dotenv.config();

const app = express();
const connectDB = require('./config/db');

// =====================
// Middleware
// =====================
app.use(morgan('combined'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// =====================
// Routes
// =====================
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');

app.use('/api/v1/reviews', reviewRoutes);   // fixed: was /api/reviews
app.use('/api/v1/coupons', couponRoutes);   // fixed: was /api/coupons
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', orderRoutes);

// =====================
// Static Files
// =====================
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// =====================
// Health Check
// =====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running...',
    environment: process.env.NODE_ENV || 'development',
  });
});

// =====================
// Error Middleware
// =====================
const { errorMiddleware } = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// =====================
// Graceful Shutdown
// =====================
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down...');
  process.exit(0);
});
