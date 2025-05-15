const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Add a single image upload middleware to create/update routes
router.post("/", auth, upload.single("image"), recipeController.createRecipe);
router.put("/:id", auth, upload.single("image"), recipeController.updateRecipe);

router.get("/", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);
router.delete("/:id", auth, recipeController.deleteRecipe);

module.exports = router;
