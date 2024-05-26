const mongoose = require('mongoose');
const diaryEntrySchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    }, 
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    content: {
        type: String,
        maxLength: 4000
    },
    images: [{type: String}],
    color: {
        type: String,
        default: '#fff'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("diaryEntry",diaryEntrySchema);
