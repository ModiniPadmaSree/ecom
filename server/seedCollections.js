const Review = require('./models/reviewModel');
const Coupon = require('./models/couponModel');
const User = require('./models/userModel');
const Product = require('./models/productModel');
console.log('🧪 Review:', Review);
console.log('🧪 Coupon:', Coupon);


const seedReviewsAndCoupons = async () => {
  const product = await Product.findOne();
  const user = await User.findOne();

  await Review.deleteMany();
  await Coupon.deleteMany();

  if (user && product) {
    await Review.create({
      user: user._id,
      product: product._id,
      rating: 4,
      comment: 'Great quality!',
    });

    await Coupon.create({
      code: 'DISCOUNT10',
      discountPercent: 10,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  console.log('✅ Review and Coupon collections seeded');
};

module.exports = seedReviewsAndCoupons;