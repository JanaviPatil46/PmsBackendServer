const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config()

const MONGODB_URL = process.env.MONGODB_URL

const dbconnect = async()=>{
    try{
        const con =await mongoose.connect(MONGODB_URL)
        console.log("monodb connected successfully")
    }catch (error) {
console.error(error);
    }
}

module.exports = dbconnect