const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const dbconnect = require('./Database/dbConnect');
const app = express();
require('dotenv').config();
app.use(express.json());
const jobRoutes = require('./Routes/jobRoutes')

app.use(cors());

app.use("/workflow/jobs", jobRoutes);

// database connect
dbconnect()

const PORT = process.env.PORT || 8008;
app.listen(PORT, ()=>{
    console.log(`connection is live at port no. ${PORT}`);
})