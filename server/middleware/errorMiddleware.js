

// This function catches asynchronous errors and passes them to the next middleware
const catchAsyncErrors = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
};

// Custom ErrorHandler class (if you don't have it already)
class CustomErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Capturing stack trace to know where the error originated
        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // MongoDB CastError (e.g., invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new CustomErrorHandler(message, 400);
    }

    // Mongoose duplicate key error (e.g., registering with existing email)
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new CustomErrorHandler(message, 400);
    }

    // JWT Error: Wrong JWT token
    if (err.name === 'JsonWebTokenError') {
        const message = `JSON Web Token is invalid. Try Again!`;
        err = new CustomErrorHandler(message, 400);
    }

    // JWT Error: Token Expired
    if (err.name === 'TokenExpiredError') {
        const message = `JSON Web Token is Expired. Try Again!`;
        err = new CustomErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

// Export the CustomErrorHandler for use in controllers
exports.CustomErrorHandler = CustomErrorHandler;
exports.catchAsyncErrors = catchAsyncErrors;
exports.errorMiddleware = errorMiddleware;

