const Post = require('../models/post.model');
const Activity = require('../models/activity.model');

// Create a post
const createPost = async (req, res) => {
    const { content, topicId, tags, repostOf } = req.body;
    try {
        const post = await Post.create({
            authorId: req.user.id,
            content,
            topicId: topicId || null,
            tags: tags || [],
            repostOf: repostOf || null,
        });

        await Activity.create({
            userId: req.user.id,
            type: repostOf ? 'REPOST' : 'POST',
            targetType: 'Post',
            targetId: post._id,
        });

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Display a post
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createPost, getPost };