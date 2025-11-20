// const mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/contacts",{
//     useCreateIndex:true,
//     useNewUrlParser:true,
//     useUnifiedTopology:true
// }).then(()=>{
//     console.log("connection successful")
// })
// .catch((e)=>{
//     console.log(" No connection ")
// })

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