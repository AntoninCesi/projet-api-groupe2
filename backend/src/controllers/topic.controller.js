const Topic = require('../models/topic.model');
const User = require('../models/user.model');

// list topics sorted by degree (hottest first), optional title search
const listTopics = async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    try {
        const filter = search
            ? { title: { $regex: String(search).trim(), $options: 'i' } }
            : {};
        const topics = await Topic.find(filter)
        .sort({ degree: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    res.json(topics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// get one topic
const getTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ error: 'Topic not found' });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// suivre / ne plus suivre un topic (toggle), maj du compteur de participants
const followTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ error: 'Topic not found' });

        const me = await User.findById(req.user.id);
        if (!me) return res.status(404).json({ error: 'User not found' });

        const already = me.followedTopics.some(id => id.equals(req.params.id));

        if (already) {
            me.followedTopics.pull(req.params.id);
            topic.participantsCount = Math.max(0, (topic.participantsCount || 0) - 1);
            await Promise.all([me.save(), topic.save()]);
            return res.json({ following: false });
        }

        me.followedTopics.push(req.params.id);
        topic.participantsCount = (topic.participantsCount || 0) + 1;
        await Promise.all([me.save(), topic.save()]);
        res.json({ following: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { listTopics, getTopic, followTopic };

