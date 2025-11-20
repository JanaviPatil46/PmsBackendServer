const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const dbconnect = require('./Database/dbConnect');
const app = express();
require('dotenv').config();
app.use(express.json());
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use(cors());



// database connect
dbconnect()

app.use('/workflow/invoices', invoiceRoutes);

const PORT = process.env.PORT || 8003;
app.listen(PORT, ()=>{
    console.log(`connection is live at port no. ${PORT}`);
})