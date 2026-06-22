const Topic = require('../models/topic.model');

// list topics sorted by degree (hottest first)
const listTopics = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
        const topics = await Topic.find()
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

module.exports = { listTopics, getTopic };

