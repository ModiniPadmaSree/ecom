// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Connect to MongoDB
const connectDB = require('./config/db');

// =====================
// Middleware
// =====================

app.use(express.json());
app.use(cookieParser());

// CORS Configuration (Frontend will be separate service in K8s)
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

app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', orderRoutes);

// =====================
// Static Files (Uploads)
// =====================

// ⚠ In production, better to use S3 or Persistent Volume
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// =====================
// Health Check Route (Important for Kubernetes readiness/liveness)
// =====================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running...',
    environment: process.env.NODE_ENV || 'development',
  });
});

// =====================
// Error Middleware (Must be last)
// =====================

const { errorMiddleware } = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

// =====================
// Start Server AFTER DB Connect
// =====================

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `✅ Server running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// =====================
// Graceful Shutdown (Kubernetes Safe)
// =====================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down...');
  process.exit(0);
});
