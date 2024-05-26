const express = require('express');
const router = express.Router();
const User = require("../models/user");
const diaryEntry = require('../models/diaryEntry')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
var fetchuser = require('../middleware/fetchUser');
const uploadOnCloud = require("../utils/cloudStorage.js");
const { upload } = require("../middleware/multer.js");
const bodyParser = require('body-parser');

router.use(bodyParser.json({ limit: '10mb', extended: true }));
router.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ROUTE 1 : (get all posts by a user) GET : /api/v1/diaryentry/userposts
router.get('/userposts', fetchuser, async(req, res)=>{
    try{
        if(!req.user){
            return res.status(401).json({status:false, message: "Unauthorized access."})
        }
        const posts = await diaryEntry.find({user: req.user.id});
        return res.status(200).json(posts);
    }catch(error){
        return res.status(500).json({status: false, message: "Internal server error"});
    }
});

// ROUTE 2 : (get post by date) GET : /api/v1/diaryentry/userpostsbydate
router.get('/userpostsbydate/:date', fetchuser, async(req, res)=>{
    try{
        if(!req.user){
            return res.status(401).json({status:false, message: "Unauthorized access."})
        }
        const date = req.params.date;
        const userPosts = await diaryEntry.find({ user: req.user.id, date: date});
        return res.status(200).json(userPosts);
    }catch(error){
        return res.status(500).json({status: false, message: "Internal server error."});
    }
});

// ROUTE 3 : (create a new post post) POST : /api/v1/diaryentry/createentry
router.post('/createentry', fetchuser, upload.fields([{ name: 'images', maxCount: 2 }]),[
    body('date').isDate().withMessage('Date must be a valid date in YYYY-MM-DD format'),
    body('content','text must be leass than 4000 characters').isLength({ max: 4000 })
],async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status:false, errors: errors.array()});
    }
    const entryData = req.body;
    try {
        if(!req.user){
            return res.status(401).json({status:false, message: "Unauthorized access."})
        }
        const existingEntry = await diaryEntry.findOne({ user: req.user.id, date: entryData.date });
        if (existingEntry) {
            return res.status(400).json({ status: false, message: "A diary entry already exists for this date." });
        }
        const Images = req.files && req.files['images'] ? req.files['images'].map(file => file.buffer) : [];
        const ImageUrls = await Promise.all(Images.map(buffer => uploadOnCloud(buffer)));
        if (ImageUrls.some(image => !image)) {
            return res.status(500).json({ status: false, message: "Error in Uploading Images" });
        }
        entryData.user = req.user.id;
        entryData.images = ImageUrls.map(img => img.url);
        const newPost = await diaryEntry.create(entryData);
        return res.status(200).json({ status: true, message: "Post created successfully", data: newPost });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error", error: error.message });
    }
});

// ROUTE 4 : (update post by id) POST : /api/v1/diaryentry/updateentry
router.put('/updateentry/:id', fetchuser, upload.fields([{ name: 'images', maxCount: 2 }]), [
    body('content', 'text must be less than 4000 characters').isLength({ max: 4000 })
], async (req, res) => {
    try {
        let ImageBuffers;
        if (req.files && req.files['images']) {
            ImageBuffers = req.files['images'].map(file => file.buffer);
        }
        const userId = req.user.id;
        const postId = req.params.id;
        const userDetails = await User.findById(userId);
        const postDetails = await diaryEntry.findById(postId);
        if (!postDetails || !userDetails || !(postDetails.user == userId)) {
            return res.status(404).json({ status: false, message: "Access not allowed or Post not found" });
        }
        const updateFields = {};
        if (req.body.content) updateFields.content = req.body.content;
        if(req.body.color) updateFields.color = req.body.color;
        if (req.body.retainedImages) {
            if (Array.isArray(req.body.retainedImages)) {
                updateFields.images = req.body.retainedImages;
            } else {
                updateFields.images = [req.body.retainedImages];
            }
        } else {
            updateFields.images = [];
        }
        if (ImageBuffers && ImageBuffers.length > 0) {
            const newImages = await Promise.all(ImageBuffers.map(buffer => uploadOnCloud(buffer)));

            if (newImages.some(image => !image)) {
                return res.status(500).json({ status: false, message: "Error in Uploading File" });
            }
            newImages.forEach(image => {
                updateFields.images.push(image.url);
            }); 
        }
        const postUpdateResult = await diaryEntry.findOneAndUpdate({ _id: postId }, updateFields, { new: true });
        if (postUpdateResult) {
            return res.status(200).json(postUpdateResult);
        } else {
            return res.status(404).json({ status: false, message: "Post not found" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// ROUTE 5 : (Delete post by id) DELETE : /api/v1/diaryentry/deleteentry/:id
router.delete('/deleteentry/:id', fetchuser, async(req,res)=>{
    try {
        if(!req.user){
            return res.status(401).json({status:false, message: "Unauthorized access."})
        }
        const requestedPostId = req.params.id;
        const Entry = await diaryEntry.findById(requestedPostId);
        if (Entry.user.toString() !== req.user.id) {
            return res.status(401).json({ status: false, message: "Unauthorized access. You cannot delete this entry." });
        }
        await diaryEntry.findByIdAndDelete(requestedPostId);
        return res.status(200).json({ status: true, message: "Diary entry deleted successfully." });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error", error: error.message });
    }
});

module.exports = router;