const express = require('express');
const router = express.Router();
const Coupon = require('../models/couponModel');

// @route GET /api/v1/coupons - Fetch all valid coupons for dropdown
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ expiresAt: { $gt: new Date() } });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error });
  }
});

// @route POST /api/v1/coupons/apply - Apply a coupon code
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    res.json({ discountPercent: coupon.discountPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply coupon', error });
  }
});

module.exports = router;
