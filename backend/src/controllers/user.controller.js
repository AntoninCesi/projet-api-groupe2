const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username bio avatarUrl isVerified isOfficialSource karma degree followedTopics followedThemes following status createdAt');
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
            actorId: me._id,
            type: 'FOLLOW',
            sourceType: 'User',
            sourceId: me._id,
        });

        res.json({ following: true});

        } catch (err) {
            res.status(500).json({ error: err.message });
    }
};

// modifier son propre profil (username / bio / avatarUrl)
const updateMe = async (req, res) => {
    try {
        const { username, bio, avatarUrl } = req.body;
        const updates = {};
        if (username !== undefined) updates.username = username;
        if (bio !== undefined) updates.bio = bio;
        if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

        // unicité du username si modifié
        if (updates.username) {
            const taken = await User.findOne({ username: updates.username, _id: { $ne: req.user.id } });
            if (taken) return res.status(409).json({ error: 'Username already taken' });
        }

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// mod/admin only : suspend or ban a user
const setUserStatus = async (req, res) => {
    if (!['moderator', 'admin'].includes(req.user.role)){
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { status } = req.body;
    if (!['active', 'suspended', 'banned'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getProfile, followUser, updateMe, setUserStatus };