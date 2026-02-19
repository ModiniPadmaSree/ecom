const express = require('express');
const router = express.Router();
const Coupon = require('../models/couponModel');

// @route POST /api/coupons/apply
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
