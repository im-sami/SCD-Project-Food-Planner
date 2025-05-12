const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authHandler');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// Get current user's profile
router.get('/me', protect, getUserProfile);

// Update current user's profile
router.put('/me', protect, updateUserProfile);

module.exports = router;