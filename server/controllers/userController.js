const User = require('../models/userModel');
const { CustomErrorHandler, catchAsyncErrors } = require('../middleware/errorMiddleware');
const sendToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendMail');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/v1/register
// @access  Public
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: { // Placeholder for now, integrate actual image upload later
            public_id: 'sample_avatar_id',
            url: '[https://placehold.co/150x150/cccccc/ffffff?text=Avatar](https://placehold.co/150x150/cccccc/ffffff?text=Avatar)',
        },
    });

    sendToken(user, 201, res);
});

// @desc    Auth user & get token
// @route   POST /api/v1/login
// @access  Public
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new CustomErrorHandler('Please enter email and password', 400));
    }

    // Select password because it's set to select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new CustomErrorHandler('Invalid credentials', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new CustomErrorHandler('Invalid credentials', 401));
    }

    sendToken(user, 200, res);
});

// @desc    Logout user
// @route   GET /api/v1/logout
// @access  Private
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

// @desc    Get user profile
// @route   GET /api/v1/me
// @access  Private
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id); // req.user is set by protect middleware

    if (!user) {
        return next(new CustomErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// @desc    Update user profile
// @route   PUT /api/v1/me/update
// @access  Private
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // If you handle avatar updates, add logic here (e.g., Cloudinary integration)
    // newUserData.avatar = { public_id: 'new_id', url: 'new_url' };

    await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
        useFindAndModify: false, // Prevents deprecation warning
    });

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
    });
});

// @desc    Update user password
// @route   PUT /api/v1/password/update
// @access  Private
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(req.body.oldPassword);

    if (!isMatch) {
        return next(new CustomErrorHandler('Old password is incorrect', 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new CustomErrorHandler('New password and confirm password do not match', 400));
    }

    user.password = req.body.newPassword;
    await user.save(); // Pre-save hook will hash the new password

    sendToken(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/password/forgot
// @access  Public
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new CustomErrorHandler('User not found with this email', 404));
    }

    // Get reset password token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // Save without re-running password validation

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Your password reset token is: \n\n${resetPasswordUrl}\n\nIf you have not requested this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'E-commerce Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new CustomErrorHandler(error.message, 500));
    }
});

// @desc    Reset Password
// @route   PUT /api/v1/password/reset/:token
// @access  Public
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Create hash token from URL token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
        return next(new CustomErrorHandler('Reset password token is invalid or has expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomErrorHandler('Password and confirm password do not match', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // Pre-save hook will hash the new password

    sendToken(user, 200, res);
});


// ADMIN ROUTES

// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, users });
});

// @desc    Get single user (Admin)
// @route   GET /api/v1/admin/user/:id
// @access  Private/Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new CustomErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, user });
});

// @desc    Update user role (Admin)
// @route   PUT /api/v1/admin/user/:id
// @access  Private/Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
    });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/admin/user/:id
// @access  Private/Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new CustomErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    // Remove user (Mongoose 6.x+ uses deleteOne() or deleteMany())
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
});