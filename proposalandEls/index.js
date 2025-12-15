const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dbconnect = require('./Database/dbConnect');
const app = express();
require('dotenv').config();
app.use(express.json());
app.use(cors());

const proposalandelsaccountwiseRoute = require('./routes/proposalandelsaccountwiseRoute');
app.use('/proposalandels/', proposalandelsaccountwiseRoute);
const proposalcreateemail = require("./middleware/proposalcreateemail");
app.use("/", proposalcreateemail);
// database connect
dbconnect()

const PORT = process.env.PORT || 8009;
app.listen(PORT, ()=>{
    console.log(`connection is live at port no. ${PORT}`);
})