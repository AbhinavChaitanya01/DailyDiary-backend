require('dotenv').config();
const mongoose = require('mongoose');
const connectToMongoDB= ()=>{
    mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true});
}
module.exports = connectToMongoDB;