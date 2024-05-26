const express = require('express');
const router = express.Router();
const User = require("../models/user");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
var fetchuser = require('../middleware/fetchUser')
const sendMail = require('../utils/mail')
const generator = require('generate-password');

// ROUTE:1 (User Registration) POST : /api/v1/auth/registeruser
router.post('/registeruser',[
    body('email','must be a valid email').isEmail(),
    body('password','Password must be atleast 8 characters ').isLength({ min: 8 }),
    body('name','Name must be minimum 2 characters').isLength({ min: 2 })
], async(req, res)=>{
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try{
        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({success,  error: "account with this email already exists!"});
        }
        const salt = bcrypt.genSaltSync(10);
        const secPass = await bcrypt.hash(req.body.password,salt);
        user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : secPass
        });
        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, process.env.REACT_APP_JWTSECRET);
        success= true;
        res.json({success, authToken});
    }catch(error){
        res.status(500).send("Some error occured");
    }
});

// ROUTE:2 (User login) POST : /api/v1/auth/loginuser
router.post('/loginuser',[
    body('email').isEmail(),
    body('password').exists()
],async(req,res)=>{
    let success= false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Incorrect credentials or user does not exist. Please check credentials or register as a new user"});
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({success, error:"incorrect credentials"});
        }
        const data= {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data,process.env.REACT_APP_JWTSECRET);
        success=true;
        res.json({success,authToken});
    } catch (error) {
        res.status(500).send("internal server error");
    }
});

// ROUTE : 3 (User Deletes account) POST: /api/v1/auth/deleteuser
router.delete('/deleteuser',fetchuser,async(req, res)=>{
    try{
        const enteredPassword = req.body.password;
        const userID = req.user.id;
        const user = await User.findById(userID);
        const passwordMatch = await bcrypt.compare(enteredPassword, user.password);
        if (!passwordMatch) {
            return res.status(500).json({ status: false, message: "Incorrect Password" });
        }
        const deleteUser = await User.findByIdAndDelete(user.id);
        return res.status(200).json({ status: true, message: "Account Deleted Successfully" });
    }catch(error){
        res.status(500).send("internal server error");
    }
})

// ROUTE : 4 (User Forgot Password - alternate flow of login) POST: /api/v1/auth/forgotpassword
router.post('/forgotpassword',[
    body('email','must be a valid email').isEmail()
],async(req,res)=>{
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        const emailID = req.body.email;
        const user = await User.findOne({email: emailID});
        if(!user){
            return res.status(404).json({status: false, error:"User with this email id does not exist. Kindly register as a new user."});
        }
        var newPassword = generator.generate({
            length: 10,
            numbers: true
        });
        const hashedPassword = await bcrypt.hash(newPassword, 10 );
        const updatedUser = await User.findOneAndUpdate({ email: emailID }, { password: hashedPassword }, { new: true });        
        sendMail(emailID,"Forgot Password on DailyDiary",`Your new password for DailyDiary is:- ${newPassword} .Use this password to login and change your password via your user profile`);
        return res.status(200).json({ status: true, message: "New Password Sent on Mail" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// ROUTE : 5 (User changes password -- login required) POST: /api/v1/auth.changepassword
router.put('/changepassword', fetchuser, async(req,res)=>{
    try{
        const userID = req.user.id;
        const user = await User.findById(userID);
        const oldPassword = req.body.password;
        const newPassword = req.body.newPassword;
        if (newPassword.length < 8) {
            return res.status(400).json({ status: false, message: "New password must be at least 8 characters long" });
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(500).json({ status: false, message: "Incorrect Password" });
        }
        const salt = bcrypt.genSaltSync(10);
        const secPass = await bcrypt.hash(newPassword,salt);
        const updatedUser = await User.updateOne({_id: userID}, {password: secPass});
        return res.status(200).json({ status: true, message: "password changed successfully"});
    }catch(error){
        console.log(hello);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;