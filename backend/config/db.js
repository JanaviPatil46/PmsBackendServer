const mongoose = require("mongoose");
require("dotenv").config();

const connectToDatabase = async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

module.exports = connectToDatabase;
