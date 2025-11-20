// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./database/connectDb");
// const noteRoutes = require("./routes/noteRoutes");

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());

// app.use("/account/notes", noteRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const dbconnect = require('./database/connectDb');
const app = express();
require('dotenv').config();
app.use(express.json());
const noteRoutes = require('./routes/noteRoutes');
app.use(cors());



// database connect
dbconnect()

app.use('/account/notes', noteRoutes);

const PORT = process.env.PORT || 8014;
app.listen(PORT, ()=>{
    console.log(`connection is live at port no. ${PORT}`);
})