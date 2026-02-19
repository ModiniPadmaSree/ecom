const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { CustomErrorHandler, catchAsyncErrors } = require('../middleware/errorMiddleware');

// @desc    Create new Order
// @route   POST /api/v1/order/new
// @access  Private
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});

// @desc    Get single order details
// @route   GET /api/v1/order/:id
// @access  Private
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product');   // 🔥 ADD THIS LINE

    if (!order) {
        return next(new CustomErrorHandler('Order not found with this ID', 404));
    }

    if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        return next(
            new CustomErrorHandler('You are not authorized to view this order', 403)
        );
    }

    res.status(200).json({
        success: true,
        order,
    });console.log(order.orderItems[0].product);

});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/me
// @access  Private
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
});

// @desc    Get all orders (Admin)
// @route   GET /api/v1/admin/orders
// @access  Private/Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

// @desc    Update order status (Admin)
// @route   PUT /api/v1/admin/order/:id
// @access  Private/Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new CustomErrorHandler('Order not found with this ID', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new CustomErrorHandler('You have already delivered this order', 400));
    }

    if (req.body.status === 'Shipped' && order.orderStatus !== 'Shipped') {
        for (let item of order.orderItems) {
            await updateStock(item.product, item.quantity);
        }
    }

    order.orderStatus = req.body.status;

    if (req.body.status === 'Delivered') {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);

    if (!product) {
        console.error(`Product with ID ${productId} not found during stock update.`);
        return;
    }

    product.stock -= quantity;

    if (product.stock < 0) {
        product.stock = 0;
    }

    await product.save({ validateBeforeSave: false });
}

// @desc    Delete order (Admin)
// @route   DELETE /api/v1/admin/order/:id
// @access  Private/Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new CustomErrorHandler('Order not found with this ID', 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
    });
});
