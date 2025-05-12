const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String },
  ingredients: [ingredientSchema],
  steps: [{ type: String, required: true }],
  tags: [{ type: String }],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      value: { type: Number, min: 1, max: 5 }
    }
  ],
  comments: [
    {
      id: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: String, required: true }
    }
  ],
  createdAt: { type: String, default: () => new Date().toISOString(), required: true }
});

module.exports = mongoose.model('Recipe', recipeSchema);