const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authHandler');
const { createComment, getComments } = require('../controllers/commentController');

// Create a comment on a recipe
router.post('/recipes/:id/comments', protect, createComment);

// Get all comments for a recipe
router.get('/recipes/:id/comments', getComments);

module.exports = router;