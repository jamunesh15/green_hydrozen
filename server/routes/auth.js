const express = require('express');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile
router.get('/profile', auth, authController.getProfile);

// Logout (client-side token removal)
router.post('/logout', auth, authController.logout);

module.exports = router;