const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const { Parser } = require('json2csv');

// @desc    Get user's meal plan for a specific week
// @route   GET /api/mealplans?weekStart=YYYY-MM-DD
// @access  Private
const getMealPlan = async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    const userId = req.user._id;

    if (!weekStart) {
      return res.status(400).json({ message: 'Week start date is required' });
    }

    const mealPlan = await MealPlan.findOne({
      userId,
      weekStartDate: new Date(weekStart),
    }).populate('slots.recipeId');

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new meal plan
// @route   POST /api/mealplans
// @access  Private
const createMealPlan = async (req, res, next) => {
  try {
    const { weekStartDate } = req.body;
    const userId = req.user._id;

    if (!weekStartDate) {
      return res.status(400).json({ message: 'Week start date is required' });
    }

    const existingPlan = await MealPlan.findOne({
      userId,
      weekStartDate: new Date(weekStartDate),
    });

    if (existingPlan) {
      return res.status(400).json({ message: 'Meal plan already exists for this week' });
    }

    const mealPlan = await MealPlan.create({
      userId,
      weekStartDate: new Date(weekStartDate),
      slots: [],
    });

    res.status(201).json(mealPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal plan slots (add/remove recipe)
// @route   PUT /api/mealplans/:id/slots
// @access  Private
const updateMealPlanSlots = async (req, res, next) => {
  try {
    const { date, recipeId } = req.body;
    const mealPlanId = req.params.id;
    const userId = req.user._id;

    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    if (mealPlan.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!date || !recipeId) {
      return res.status(400).json({ message: 'Date and recipeId are required' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Remove existing slot for the date, if any
    mealPlan.slots = mealPlan.slots.filter(slot => slot.date.toISOString() !== new Date(date).toISOString());

    // Add new slot
    mealPlan.slots.push({ date: new Date(date), recipeId });

    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate shopping list for a meal plan
// @route   GET /api/mealplans/:id/shopping-list?format=pdf|csv
// @access  Private
const generateShoppingList = async (req, res, next) => {
  try {
    const mealPlanId = req.params.id;
    const userId = req.user._id;
    const { format } = req.query;

    const mealPlan = await MealPlan.findById(mealPlanId).populate('slots.recipeId');
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    if (mealPlan.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Aggregate ingredients
    const ingredientsMap = new Map();
    for (const slot of mealPlan.slots) {
      const recipe = slot.recipeId;
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name}-${ingredient.unit}`;
        if (ingredientsMap.has(key)) {
          ingredientsMap.set(key, {
            name: ingredient.name,
            qty: ingredientsMap.get(key).qty + ingredient.qty,
            unit: ingredient.unit,
          });
        } else {
          ingredientsMap.set(key, {
            name: ingredient.name,
            qty: ingredient.qty,
            unit: ingredient.unit,
          });
        }
      }
    }

    const shoppingList = Array.from(ingredientsMap.values());

    if (format === 'csv') {
      const fields = ['name', 'qty', 'unit'];
      const parser = new Parser({ fields });
      const csv = parser.parse(shoppingList);
      res.header('Content-Type', 'text/csv');
      res.attachment('shopping-list.csv');
      return res.send(csv);
    } else {
      // For simplicity, return JSON (PDF generation would require additional libraries like pdfkit)
      res.json(shoppingList);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getMealPlan, createMealPlan, updateMealPlanSlots, generateShoppingList };