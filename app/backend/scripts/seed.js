const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Load env
dotenv.config({ path: "../.env" });

const User = require("../models/User");
const Recipe = require("../models/Recipe");
const MealPlan = require("../models/MealPlan");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/recipe-planner";

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Remove old data
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await MealPlan.deleteMany({});

  // Create dummy user
  const user = await User.create({
    name: "sami",
    email: "sami@gmail.com",
    password: "123456",
  });

  // Create dummy recipes
  const recipes = await Recipe.insertMany([
    {
      title: "Spaghetti Bolognese",
      ingredients: [
        { name: "Spaghetti", quantity: 200, unit: "g" },
        { name: "Ground Beef", quantity: 250, unit: "g" },
        { name: "Tomato Sauce", quantity: 1, unit: "cup" },
      ],
      steps: [
        "Boil spaghetti according to package instructions.",
        "Cook ground beef until browned.",
        "Add tomato sauce and simmer.",
        "Combine with spaghetti and serve.",
      ],
      tags: ["Italian", "Pasta"],
      ownerId: user._id,
      isPublic: true,
      imageUrl: "",
      ratings: [],
      comments: [],
    },
    {
      title: "Chicken Salad",
      ingredients: [
        { name: "Chicken Breast", quantity: 150, unit: "g" },
        { name: "Lettuce", quantity: 100, unit: "g" },
        { name: "Tomato", quantity: 1, unit: "pc" },
      ],
      steps: [
        "Grill chicken breast and slice.",
        "Chop lettuce and tomato.",
        "Mix all ingredients and serve.",
      ],
      tags: ["Salad", "Healthy"],
      ownerId: user._id,
      isPublic: true,
      imageUrl: "",
      ratings: [],
      comments: [],
    },
  ]);

  // Create a dummy meal plan for this week
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

  await MealPlan.create({
    userId: user._id,
    weekStartDate: weekStart.toISOString().split("T")[0],
    slots: [
      {
        date: weekStart.toISOString().split("T")[0],
        recipeId: recipes[0]._id,
        mealType: "dinner",
      },
      {
        date: weekStart.toISOString().split("T")[0],
        recipeId: recipes[1]._id,
        mealType: "lunch",
      },
    ],
  });

  console.log("Dummy data inserted!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
