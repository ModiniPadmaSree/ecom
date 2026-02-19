// server/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const seedReviewsAndCoupons = require('./seedCollections');

const runSeeding = async () => {
  try {
    await connectDB();
    await seedReviewsAndCoupons();
    console.log('✅ Seeding completed successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeding();
