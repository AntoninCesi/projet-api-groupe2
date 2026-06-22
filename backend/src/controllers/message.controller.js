const Message = require('../models/message.model');
const User = require('../models/user.model');

// send a message
const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    try {
        if (receiverId === req.user.id) {
            return res.status(400).json({ error: 'Cannot message yourself' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ error: 'User not found' });

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

// get conversation with a user (both directions)
const getConversation = async (req, res) => {
    const { page = 1, limit = 30 } = req.query;
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user.id },
            ],
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        await Message.updateMany(
            { senderId: req.params.userId, receiverId: req.user.id, isRead: false },
            { isRead: true }
        );

        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// list conversations (last message per contact)
const listConversations = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
        }).sort({ createdAt: -1 });

        const seen = new Set();
        const conversations = [];
        for (const msg of messages) {
            const contactId = msg.senderId.equals(req.user.id)
                ? msg.receiverId.toString()
                : msg.senderId.toString();
            if (!seen.has(contactId)) {
                seen.add(contactId);
                conversations.push(msg);
            }
        }

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { sendMessage, getConversation, listConversations };