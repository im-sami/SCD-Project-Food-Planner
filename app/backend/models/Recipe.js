const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: {
    type: String,
    validate: {
      validator: function (v) {
        // Basic URL validation
        return !v || /^(https?:\/\/|\/uploads\/|data:image\/).*/.test(v);
      },
      message: (props) => `${props.value} is not a valid image URL!`,
    },
    get: function (v) {
      // Handle relative paths by prepending server URL if needed
      if (v && v.startsWith("/uploads/")) {
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? process.env.SERVER_URL
            : "http://localhost:5000";
        return `${baseUrl}${v}`;
      }
      return v;
    },
  },
  ingredients: [ingredientSchema],
  steps: [{ type: String, required: true }],
  cookingTimeMinutes: { type: Number, default: 30 }, // Added cooking time field
  tags: [{ type: String }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublic: { type: Boolean, default: false },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      value: { type: Number, min: 1, max: 5 },
    },
  ],
  comments: [
    {
      id: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: String, required: true },
    },
  ],
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
    required: true,
  },
});

// Make sure virtuals are included in JSON output
recipeSchema.set("toJSON", {
  virtuals: true,
  getters: true,
  transform: (doc, ret) => {
    if (!ret.imageUrl) {
      ret.imageUrl = "/default-recipe-image.jpg";
    }
    return ret;
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
