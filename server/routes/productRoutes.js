const express = require('express');
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReviews,
    deleteReview,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getProductDetails);
router.route('/reviews').get(getProductReviews);

// Protected routes (User)
router.route('/review').put(protect, createProductReview);

// Admin routes
router
    .route('/admin/products/new')
    .post(protect, authorizeRoles('admin'), createProduct);

router
    .route('/admin/product/:id')
    .put(protect, authorizeRoles('admin'), updateProduct)
    .delete(protect, authorizeRoles('admin'), deleteProduct);

router
    .route('/admin/reviews')
    .delete(protect, authorizeRoles('admin'), deleteReview);

module.exports = router;