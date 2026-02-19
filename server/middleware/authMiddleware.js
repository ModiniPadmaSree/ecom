// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { CustomErrorHandler, catchAsyncErrors } = require('./errorMiddleware');

// Middleware to protect routes - checks if user is authenticated
exports.protect = catchAsyncErrors(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) { // Check for token in cookies as well
        token = req.cookies.token;
    }

    if (!token) {
        return next(new CustomErrorHandler('Not authorized to access this resource, no token', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id); // Attach user to the request object
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return next(new CustomErrorHandler('Token has expired, please log in again', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new CustomErrorHandler('Invalid token, please log in again', 401));
        }
        return next(new CustomErrorHandler('Not authorized, token failed', 401));
    }
});

// Middleware to restrict access based on user role
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new CustomErrorHandler(
                    `Role (${req.user.role}) is not allowed to access this resource`,
                    403 // Forbidden
                )
            );
        }
        next();
    };
};
