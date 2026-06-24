const Post = require('../models/post.model');
const Activity = require('../models/activity.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Topic = require('../models/topic.model');
const Report = require('../models/report.model');

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

        if (post.topicId) {
            await Topic.findByIdAndUpdate(post.topicId, { $inc: { postsCount: 1 } });
        }

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Display a post
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'username avatarUrl isVerified isOfficialSource')
            .populate('topicId', 'title')
            .populate('comments.authorId', 'username avatarUrl isVerified isOfficialSource')
            .populate('comments.replies.authorId', 'username avatarUrl isVerified isOfficialSource');
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Like / Unlike a post (toggle)
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const userId = req.user.id;
        const alreadyLiked = post.likes.some(id => id.equals(userId));

        if (alreadyLiked) {
            post.likes.pull(userId);
            await post.save();
            return res.json({ liked: false, likesCount: post.likes.length });
        }

        post.likes.push(userId);
        await post.save();

        await Activity.create({
            userId,
            type: 'LIKE',
            targetType: 'Post',
            targetId: post._id,
        });

        if (!post.authorId.equals(userId)) {
            await Notification.create({
                userId: post.authorId,
                actorId: userId,
                type: 'LIKE',
                sourceType: 'Post',
                sourceId: post._id,
            });
        }
        res.json({ liked: true, likesCount: post.likes.length });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add a comment on a post
const addComment = async (req, res) => {
    const { content } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = { authorId: req.user.id, content };
        post.comments.push(comment);
        await post.save();

        const savedComment = post.comments[post.comments.length - 1];

        await Activity.create({
            userId: req.user.id,
            type: 'COMMENT',
            targetType: 'Post',
            targetId: post._id,
        });

        if (!post.authorId.equals(req.user.id)) {
            await Notification.create({
                userId: post.authorId,
                actorId: req.user.id,
                type: 'MENTION',
                sourceType: 'Post',
                sourceId: post._id,
            });
        }

        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add a reply on a comment
const addReply = async (req, res) => {
    const { content, replyTo } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const reply = { authorId: req.user.id, content, replyTo: replyTo || null };
        comment.replies.push(reply);
        await post.save();

        const savedReply = comment.replies[comment.replies.length - 1];

        await Activity.create({
            userId: req.user.id,
            type: 'COMMENT',
            targetType: 'Comment',
            targetId: comment._id,
        });

        if (!comment.authorId.equals(req.user.id)) {
            await Notification.create({
                userId: comment.authorId,
                actorId: req.user.id,
                type: 'MENTION',
                sourceType: 'Post',
                sourceId: post._id,
            });
        }

        res.status(201).json(savedReply);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle like on a comment
const likeComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const userId = req.user.id;
        const already = comment.likes.some(id => id.equals(userId));
        already ? comment.likes.pull(userId) : comment.likes.push(userId);
        await post.save();

        // notifie l'auteur du commentaire (à l'ajout du like, pas sur soi-même)
        if (!already && !comment.authorId.equals(userId)) {
            await Notification.create({
                userId: comment.authorId,
                actorId: userId,
                type: 'LIKE',
                sourceType: 'Post',
                sourceId: post._id,
            });
        }

        res.json({ liked: !already, likesCount: comment.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle like on a reply
const likeReply = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        const reply = comment.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ error: 'Reply not found' });

        const userId = req.user.id;
        const already = reply.likes.some(id => id.equals(userId));
        already ? reply.likes.pull(userId) : reply.likes.push(userId);
        await post.save();

        // notifie l'auteur de la réponse (à l'ajout du like, pas sur soi-même)
        if (!already && !reply.authorId.equals(userId)) {
            await Notification.create({
                userId: reply.authorId,
                actorId: userId,
                type: 'LIKE',
                sourceType: 'Post',
                sourceId: post._id,
            });
        }

        res.json({ liked: !already, likesCount: reply.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// List all posts (filtrable par topic et/ou auteur)
const listPosts = async (req, res) => {
    const { topicId, authorId, tag, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (topicId) filter.topicId = topicId;
    if (authorId) filter.authorId = authorId;
    if (tag) filter.tags = tag;
    try {
        const posts = await Post.find(filter)
            .populate('authorId', 'username avatarUrl isVerified isOfficialSource')
            .populate('topicId', 'title')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Chronological feed (from followed users)
const getFeed = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
        const me = await User.findById(req.user.id).select('following');
        const posts = await Post.find({ authorId: { $in: me.following } })
            .populate('authorId', 'username avatarUrl isVerified isOfficialSource')
            .populate('topicId', 'title')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// report a post
const reportPost = async (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Missing reason' });
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const report = await Report.create({
            reporterId: req.user.id,
            postId: post._id,
            reason,
        });
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createPost, getPost, likePost, addComment, addReply, likeComment, likeReply, listPosts, getFeed, reportPost };