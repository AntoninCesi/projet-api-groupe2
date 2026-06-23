const mongoose = require('mongoose');
const Message = require('../models/message.model');

// show the last message
const listConversations = async (req, res) => {
    try {
        const me = new mongoose.Types.ObjectId(req.user.id);
        const conversations = await Message.aggregate([
            { $match: { $or: [{ senderId: me }, { receiverId: me }] } },
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: { $cond: [{ $eq: ['$senderId', me] }, '$receiverId', '$senderId'] },
                doc: { $first: '$$ROOT' },
            } },
            { $replaceRoot: { newRoot: '$doc' } },
            { $sort: { createdAt: -1 } },
        ]);
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// chronological messages with userId
const getConversation = async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user id' });
    }
    try {
        const me = req.user.id;
        const messages = await Message.find({
            $or: [
                { senderId: me, receiverId: userId },
                { senderId: userId, receiverId: me },
            ],
        }).sort({ createdAt: 1 });

        await Message.updateMany(
            { senderId: userId, receiverId: me, isRead: false },
            { isRead: true }
        );

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// send message to selected ID
const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    if (!mongoose.isValidObjectId(receiverId)) {
        return res.status(400).json({ error: 'Invalid receiver id' });
    }
    if (String(receiverId) === String(req.user.id)) {
        return res.status(400).json({ error: 'Cannot message yourself' });
    }
    try {
        const message = await Message.create({
            senderId: req.user.id,
            receiverId,
            content,
        });
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { listConversations, getConversation, sendMessage };
