const Notification = require('../models/notification.model');

// notifications de l'utilisateur connecté, plus récentes d'abord
const listNotifications = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// marque toutes les notifications de l'utilisateur comme lues
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { listNotifications, markAllRead };
