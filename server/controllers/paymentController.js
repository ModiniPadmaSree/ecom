const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use your actual secret key
const { catchAsyncErrors } = require('../middleware/errorMiddleware');

// @desc    Create Stripe Checkout Session
// @route   POST /api/v1/payment/checkout
// @access  Private
exports.createCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  const {orderItems: cartItems, shippingInfo } = req.body;
if (!Array.isArray(cartItems)) {
  return res.status(400).json({ message: 'orderItems must be an array' });
}

  const line_items = cartItems.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.image],
        
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'IN'], // Add/remove as needed
    },
    success_url: `${process.env.FRONTEND_URL}/orders/me`,
    cancel_url: `${process.env.FRONTEND_URL}/cart`,
    customer_email: req.user.email,
    metadata: {
      userId: req.user._id.toString(),
    },
  });

  res.status(200).json({ sessionId: session.id });
});
