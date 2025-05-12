const Recipe = require('../models/Recipe');
const path = require('path');
const fs = require('fs');

// @desc    Get all recipes (filtered by tag, owner, public, or search)
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res, next) => {
  try {
    const { tag, owner, public: isPublic, search } = req.query;
    let query = {};

    if (tag) query.tags = tag;
    if (owner) query.ownerId = owner;
    if (isPublic === 'true') query.isPublic = true;
    if (search) query.title = { $regex: search, $options: 'i' };

    const recipes = await Recipe.find(query).populate('ownerId', 'name');
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ownerId', 'name')
      .populate('comments');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res, next) => {
  try {
    const { title, ingredients, steps, tags, isPublic } = req.body;
    const userId = req.user._id;

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: 'Title, ingredients, and steps are required' });
    }

    const recipeData = {
      title,
      ingredients: JSON.parse(ingredients),
      steps: JSON.parse(steps),
      tags: tags ? JSON.parse(tags) : [],
      ownerId: userId,
      isPublic: isPublic === 'true',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
    };

    const recipe = await Recipe.create(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = async (req, res, next) => {
  try {
    const { title, ingredients, steps, tags, isPublic } = req.body;
    const userId = req.user._id;
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    recipe.title = title || recipe.title;
    recipe.ingredients = ingredients ? JSON.parse(ingredients) : recipe.ingredients;
    recipe.steps = steps ? JSON.parse(steps) : recipe.steps;
    recipe.tags = tags ? JSON.parse(tags) : recipe.tags;
    recipe.isPublic = isPublic !== undefined ? isPublic === 'true' : recipe.isPublic;
    if (req.file) {
      // Delete old image if exists
      if (recipe.imageUrl) {
        fs.unlinkSync(path.join(__dirname, '..', recipe.imageUrl));
      }
      recipe.imageUrl = `/uploads/${req.file.filename}`;
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete image if exists
    if (recipe.imageUrl) {
      fs.unlinkSync(path.join(__dirname, '..', recipe.imageUrl));
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a recipe
// @route   POST /api/recipes/:id/ratings
// @access  Private
const rateRecipe = async (req, res, next) => {
  try {
    const { value } = req.body;
    const userId = req.user._id;
    const recipeId = req.params.id;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already rated
    const existingRating = recipe.ratings.find(r => r.userId.toString() === userId.toString());
    if (existingRating) {
      existingRating.value = value;
    } else {
      recipe.ratings.push({ userId, value });
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a recipe
// @route   POST /api/recipes/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const recipeId = req.params.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const newComment = {
      id: new Date().getTime().toString(), // Simple unique ID
      userId,
      text,
      createdAt: new Date().toISOString(),
    };

    recipe.comments.push(newComment);
    await recipe.save();

    res.status(201).json(newComment); // Return the new comment as expected by frontend
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, rateRecipe, addComment };