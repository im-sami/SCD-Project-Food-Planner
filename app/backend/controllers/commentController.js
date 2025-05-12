const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');

// @desc    Create a comment on a recipe
// @route   POST /api/recipes/:id/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const recipeId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = await Comment.create({
      recipeId,
      userId,
      text,
    });

    recipe.comments.push(comment._id);
    await recipe.save();

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a recipe
// @route   GET /api/recipes/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const recipeId = req.params.id;

    const comments = await Comment.find({ recipeId }).populate('userId', 'name');
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

module.exports = { createComment, getComments };