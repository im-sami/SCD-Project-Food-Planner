const mongoose = require('mongoose');

const mealSlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  mealType: { type: String, required: true },
});

const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: String, required: true },
  slots: [mealSlotSchema],
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);