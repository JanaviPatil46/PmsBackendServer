// routes/automationRoutes.js
const express = require('express');
const {
  AutomationsMails,
 
} = require('../controllers/automationController');

const router = express.Router();

// Routes
router.post('/', AutomationsMails); // Create a new automation


module.exports = router;
