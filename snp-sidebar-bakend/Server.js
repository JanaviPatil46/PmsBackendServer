const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
const sidebarDataRoutes = require('./routes/sidebarDataRoutes');
const newSidebarDataRoutes = require('./routes/newSidebarDataRoutes');
require("dotenv").config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes for main sidebar
app.use('/api', sidebarDataRoutes);

// Routes for left sidebar

app.use('/newsidebar', newSidebarDataRoutes);


const connectToDatabase = require("../snp-sidebar-bakend/config/db");

const dbConStatus = connectToDatabase();

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
