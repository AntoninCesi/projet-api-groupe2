const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username bio avatarUrl isOfficialSource karma degree createdAt');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const followersCount = await User.countDocuments({ following: req.params.id });
        res.json({ ...user.toObject(), followersCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// follow / unfollow (toggle)
const followUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ error: 'User not found' });

        const me = await User.findById(req.user.id);
        const alreadyFollowing = me.following.some(id => id.equals(req.params.id));

        if (alreadyFollowing) {
            me.following.pull(req.params.id);
            await me.save();
            return res.json({ following: false });
        }

        me.following.push(req.params.id);
        await me.save();

        await Notification.create({
            userId: target._id,
            type: 'FOLLOW',
            sourceType: 'User',
            sourceId: me._id,
        });

        res.json({ following: true});

        } catch (err) {
            res.status(500).json({ error: err.message });
    }
};

module.exports = { getProfile, followUser };