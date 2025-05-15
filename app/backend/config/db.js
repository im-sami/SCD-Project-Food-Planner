const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Determine which connection string to use based on environment
    const connectionString =
      process.env.NODE_ENV === "production" ||
      process.env.GITHUB_ACTIONS === "true"
        ? "mongodb://mongo:27017/recipe-planner"
        : process.env.MONGO_URI;

    console.log(`Connecting to MongoDB with string: ${connectionString}`);

    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
