const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    content: { type: String, required: true, maxlength:280 },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    content: { type: String, required: true, maxlength:280 },
    replies: [replySchema]
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    content: { type: String, required: true, maxlength:280 },
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);