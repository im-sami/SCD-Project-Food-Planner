const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authHandler');
const {
  getMealPlan,
  createMealPlan,
  updateMealPlanSlots,
  generateShoppingList,
} = require('../controllers/mealplanController');

// Get meal plan for a specific week
router.get('/', protect, getMealPlan);

// Create a new meal plan
router.post('/', protect, createMealPlan);

// Update meal plan slots
router.put('/:id/slots', protect, updateMealPlanSlots);

// Generate shopping list
router.get('/:id/shopping-list', protect, generateShoppingList);

module.exports = router;