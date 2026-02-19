const express = require('express');
const router = express.Router();
const Review = require('../models/reviewModel');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Review creation failed', error });
  }
});

// @route GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get reviews', error });
  }
});

module.exports = router;
