// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const automationRoutes = require('./routes/automationRoutes');

dotenv.config();
const app = express();

// Connect to database
connectDB();
// ? Add this CORS config
app.use(cors({
  origin: ["http://localhost:3000", "https://www.snptaxes.com","https://snptaxes.com"],
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));

// ? Express must handle preflight
app.options("*", cors());
app.use(express.json()); 

// Routes
app.use('/automations', automationRoutes);

// Server setup
const PORT = process.env.PORT || 8011;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
