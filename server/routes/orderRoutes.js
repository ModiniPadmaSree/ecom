const express = require('express');
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes (User)
router.route('/order/new').post(protect, newOrder);
router.route('/order/:id').get(protect, getSingleOrder);
router.route('/orders/me').get(protect, myOrders);

// Admin routes
router
    .route('/admin/orders')
    .get(protect, authorizeRoles('admin'), getAllOrders);

router
    .route('/admin/order/:id')
    .put(protect, authorizeRoles('admin'), updateOrder)
    .delete(protect, authorizeRoles('admin'), deleteOrder);

module.exports = router;