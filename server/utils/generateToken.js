const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
        ),
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        // secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
        // sameSite: 'strict', // Helps mitigate CSRF attacks (adjust as needed for cross-site requests)
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;