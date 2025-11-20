const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const dbconnect = require('./database/dbconnect');
const app = express();
require('dotenv').config();
app.use(express.json());
const organizerTempRoutes = require('./routes/organizerTempRoutes')
const organizerAccountWiseRoute = require("./routes/organizerAccountWiseRoute");

app.use(cors());



// database connect
dbconnect()

// routes
app.use("/workflow/organizers", organizerTempRoutes);

app.use("/workflow/orgaccwise", organizerAccountWiseRoute);

const organizersendemail = require("./middleware/organizersendmail");
app.use("/", organizersendemail);

const PORT = process.env.PORT || 8007;
app.listen(PORT, ()=>{
    console.log(`connection is live at port no. ${PORT}`);
})