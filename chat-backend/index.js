const express = require('express');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chatsRoutes');  // Adjust the path as needed
const dbconnect = require('./database/db');
const cors = require('cors');
const app = express();
const chatsendemail = require('./middleware/chatsendemail');
const chatmessagesendemail = require('./middleware/chatmessagesendemail');


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Use the chat routes
app.use('/chats', chatRoutes);
app.use('/chatsend', chatsendemail);
app.use('/chatmsg', chatmessagesendemail);

 //Cors Polycy 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true'); // Set the header to 'true' to allow credentials
    next();
  });
 
// database connect
dbconnect()

// Start the server
const port = process.env.PORT || 8010;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
