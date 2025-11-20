const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbconnect = require('./database/db');
const cors = require('cors');
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true'); // Set the header to 'true' to allow credentials
    next();
  });


const internalChatRoutes = require("./routes/internalChatRoutes");
app.use("/api/internalchat", internalChatRoutes);


// database connect
dbconnect()

// Start the server
const port = process.env.PORT || 8017;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
