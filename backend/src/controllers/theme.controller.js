const Topic = require('../models/topic.model');
const User = require('../models/user.model');

// liste des thèmes = catégories de topics, agrégées et triées par chaleur
const listThemes = async (req, res) => {
    try {
        const themes = await Topic.aggregate([
            { $match: { category: { $nin: [null, ''] } } },
            { $sort: { degree: -1 } }, // pour que $first = topic le plus chaud
            { $group: {
                _id: '$category',
                degree: { $max: '$degree' },
                topicsCount: { $sum: 1 },
                postsCount: { $sum: '$postsCount' },
                participantsCount: { $sum: '$participantsCount' },
                topTopic: { $first: '$title' },
            } },
            { $sort: { degree: -1 } },
        ]);
        // _id (la catégorie) -> name
        res.json(themes.map(({ _id, ...rest }) => ({ name: _id, ...rest })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// un thème (catégorie) + ses topics triés par chaleur
const getTheme = async (req, res) => {
    const name = req.params.name;
    try {
        const topics = await Topic.find({ category: name }).sort({ degree: -1 });
        if (topics.length === 0) return res.status(404).json({ error: 'Theme not found' });

        res.json({
            name,
            degree: topics[0].degree,
            topicsCount: topics.length,
            postsCount: topics.reduce((s, t) => s + (t.postsCount || 0), 0),
            participantsCount: topics.reduce((s, t) => s + (t.participantsCount || 0), 0),
            topics,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// suivre / ne plus suivre un thème (toggle)
const followTheme = async (req, res) => {
    const name = req.params.name;
    try {
        const me = await User.findById(req.user.id);
        if (!me) return res.status(404).json({ error: 'User not found' });

        if (me.followedThemes.includes(name)) {
            me.followedThemes.pull(name);
            await me.save();
            return res.json({ following: false });
        }

        me.followedThemes.push(name);
        await me.save();
        res.json({ following: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { listThemes, getTheme, followTheme };
