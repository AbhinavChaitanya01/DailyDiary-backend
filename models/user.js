const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type: String, 
        required: true, 
        minLength: 2
    }, 
    email:{
        type: String, 
        required: true, 
        unique: true
    }, 
    password:{
        type: String, 
        required: true, 
        minLength: 8
    }
},{
    timestamps: true
});
const User = mongoose.model("user", userSchema);
module.exports = User;