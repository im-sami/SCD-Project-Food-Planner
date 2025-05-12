const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorHandler');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes
app.use('/api/users', require('./routes/users')); // User profile routes
app.use('/api/recipes', require('./routes/recipes')); // Recipe CRUD routes
app.use('/api/mealplans', require('./routes/mealPlans')); // Meal planning routes
app.use('/api/comments', require('./routes/comments')); // Comment routes

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));