const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('../models/user/model');

const replySchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 280 },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

const commentSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 280 },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    replies: [replySchema],
}, { timestamps: true });

const postSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
    repostOf: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    content: { type: String, required: true, maxlength: 280 },
    tags: { type: [String], default: [] },
    media: { type: [{ type: { type: String }, url: String }], default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    comments: { type: [commentSchema], default: [] },
    shareCount: { type: Number, default: 0 },
}, { timestamps: true });

// list all posts
const listPosts = async (req, res) => {
    const { topicId, page = 1, limit = 20 } = req.query;
    const filter = topicId ? { topicId } : {};
    try {
        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .skip((page -1) * limit)
            .limit(Number(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// chronological feed
const getFeed = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
        const me = await User.findById(req.user.id).select('following');
        const posts = await Post.find({ authorId: { $in: me.following } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createPost, getPost, likePost, addComment, addReply, listPosts, getFeed };