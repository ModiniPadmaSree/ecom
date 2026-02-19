// backend/routes/userRoutes.js
const express = require('express');
const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getAllUsers,
    getSingleUser,
    updateUserRole,
    deleteUser,
} = require('../controllers/userController'); // All user-related controller functions
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Authentication and authorization middleware

const router = express.Router(); // Initialize an Express Router instance

// Public Routes (Accessible without authentication)
router.post('/register', registerUser);      // Register a new user
router.post('/login', loginUser);          // Log in a user and get JWT
router.post('/password/forgot', forgotPassword); // Request password reset
router.put('/password/reset/:token', resetPassword); // Reset password using token
router.get('/logout', logoutUser);          // Log out a user

// Protected User Routes (Require authentication, specific to the logged-in user)
router.get('/me', protect, getUserProfile);         // Get logged-in user's profile
router.put('/me/update', protect, updateUserProfile); // Update logged-in user's profile details
router.put('/password/update', protect, updatePassword); // Update logged-in user's password

// Protected Admin Routes (Require authentication and 'admin' role)
router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsers); // Get all users (Admin dashboard)
router
    .route('/admin/user/:id')
    .get(protect, authorizeRoles('admin'), getSingleUser)    // Get single user details by ID
    .put(protect, authorizeRoles('admin'), updateUserRole)  // Update user's role (e.g., from user to admin)
    .delete(protect, authorizeRoles('admin'), deleteUser);  // Delete a user by ID

module.exports = router; // Export the configured router
