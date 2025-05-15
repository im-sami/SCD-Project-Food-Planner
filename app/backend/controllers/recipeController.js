const Recipe = require("../models/Recipe");
const path = require("path");
const fs = require("fs");

// @desc    Get all recipes (filtered by tag, owner, public, or search)
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res, next) => {
  try {
    const { tag, owner, public: isPublic, search } = req.query;
    let query = {};

    if (tag) query.tags = tag;
    if (owner) query.ownerId = owner;
    if (isPublic === "true") query.isPublic = true;
    if (search) query.title = { $regex: search, $options: "i" };

    const recipes = await Recipe.find(query).populate("ownerId", "name");
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
      .populate("ownerId", "name")
      .populate("comments");
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
  try {
    let { ingredients, steps, tags, ...otherFields } = req.body;

    // Parse ingredients if it's a string
    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }

    // Parse steps if it's a string
    if (typeof steps === "string") {
      steps = JSON.parse(steps);
    }

    // Parse tags if it's a string
    if (typeof tags === "string") {
      tags = JSON.parse(tags);
    }

    // Handle image upload if present
    if (req.file) {
      // Convert the file buffer to a base64 data URL for storage in database
      const imageBuffer = req.file.buffer;
      const imageType = req.file.mimetype;
      const base64Image = `data:${imageType};base64,${imageBuffer.toString(
        "base64"
      )}`;
      otherFields.imageUrl = base64Image;
    }

    // Add the authenticated user as the owner
    otherFields.ownerId = req.user.id;

    const recipe = new Recipe({
      ...otherFields,
      ingredients,
      steps,
      tags,
    });
    await recipe.save();

    res.status(201).json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    let recipeData = req.body;

    // Parse ingredients if it's a string
    if (typeof recipeData.ingredients === "string") {
      recipeData.ingredients = JSON.parse(recipeData.ingredients);
    }

    // Parse steps if it's a string
    if (typeof recipeData.steps === "string") {
      recipeData.steps = JSON.parse(recipeData.steps);
    }

    // Parse tags if it's a string
    if (typeof recipeData.tags === "string") {
      recipeData.tags = JSON.parse(recipeData.tags);
    }

    // Handle image upload if present
    if (req.file) {
      // Convert the file buffer to a base64 data URL for storage in database
      const imageBuffer = req.file.buffer;
      const imageType = req.file.mimetype;
      const base64Image = `data:${imageType};base64,${imageBuffer.toString(
        "base64"
      )}`;
      recipeData.imageUrl = base64Image;
    }

    // Check if the user owns this recipe before updating
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this recipe" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, recipeData, {
      new: true,
    });
    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(400).json({ message: error.message });
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
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Do NOT attempt to delete image files from disk, since images are not stored on disk

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
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
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already rated
    const existingRating = recipe.ratings.find(
      (r) => r.userId.toString() === userId.toString()
    );
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
      return res.status(400).json({ message: "Comment text is required" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
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

module.exports = {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  addComment,
};
