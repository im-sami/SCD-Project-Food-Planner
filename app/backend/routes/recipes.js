const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authHandler');
const { upload } = require('../middlewares/upload');
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  addComment,
} = require('../controllers/recipeController');

// Get all recipes (filtered)
router.get('/', getRecipes);

// Get a single recipe
router.get('/:id', getRecipe);

// Create a new recipe
router.post('/', protect, upload, createRecipe);

// Update a recipe
router.put('/:id', protect, upload, updateRecipe);

// Delete a recipe
router.delete('/:id', protect, deleteRecipe);

// Rate a recipe
router.post('/:id/ratings', protect, rateRecipe);


// Delete a recipe
router.delete('/:id', protect, deleteRecipe);

// Rate a recipe
router.post('/:id/ratings', protect, rateRecipe);

// Add a comment to a recipe
router.post('/:id/comments', protect, addComment);

module.exports = router;