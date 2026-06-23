const Topic = require('../models/topic.model');
const Activity = require('../models/activity.model');
const Post = require('../models/post.model');

const POLYMARKET_URL = 'https://gamma-api.polymarket.com/events?active=true&closed=false&order=volume24hr&ascending=false&limit=100';

const logNorm = (val) => val > 0 ? Math.log(val + 1) : 0;

const recalculateDegrees = async () => {
    const topics = await Topic.find();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weights = { POST: 4, REPOST: 5, COMMENT: 3, LIKE: 1 };

    // passe 1 : chaleur brute (interne + externe) de chaque topic
    const scored = [];
    for (const topic of topics) {
        const posts = await Post.find({ topicId: topic._id }).select('_id');
        const postIds = posts.map(p => p._id);

        const activities = await Activity.find({
            targetId: { $in: postIds },
            createdAt: { $gte: since },
        });

        const rawHeat = activities.reduce((sum, a) => sum + (weights[a.type] || 1), 0);

        const heatInt = logNorm(rawHeat);
        const heatExt = logNorm(topic.polymarketVolume24hr);
        const wInt = topic.source === 'COMMUNITY' ? 1 : 0.6;
        const wExt = topic.source === 'COMMUNITY' ? 0 : 0.4;

        topic.internalHeat = Math.round(heatInt * 100) / 100;
        topic.externalHeat = Math.round(heatExt * 100) / 100;
        topic.postsCount = postIds.length;

        scored.push({ topic, combined: wInt * heatInt + wExt * heatExt });
    }

    // passe 2 : on normalise par le plus chaud -> degree réparti sur 0..100
    const maxCombined = scored.reduce((max, s) => Math.max(max, s.combined), 0);

    for (const { topic, combined } of scored) {
        const prevDegree = topic.degree;
        topic.degree = maxCombined > 0 ? Math.round((combined / maxCombined) * 100) : 0;
        topic.isOnFire = topic.degree >= 90;
        topic.variationPct = prevDegree > 0
            ? Math.round(((topic.degree - prevDegree) / prevDegree) * 100)
            : 0;

        // snapshot pour les sparklines, on garde les 48 derniers points (~12h à 15mn)
        topic.history.push({ t: Math.floor(Date.now() / 1000), p: topic.degree });
        if (topic.history.length > 48) {
            topic.history = topic.history.slice(-48);
        }

        await topic.save();
    }
};

// fetch events from Polymarket and upsert Topics
const syncPolymarket = async () => {
    try {
        const res = await fetch(POLYMARKET_URL);
        const events = await res.json();

        for (const event of events) {
            // catégorie = 1er tag Polymarket (sert de "thème" côté app), best-effort
            const category = event.tags?.[0]?.label || event.category || '';
            await Topic.findOneAndUpdate (
                { polymarketId: event.id },
                {
                    title: event.title,
                    description: event.description || '',
                    category,
                    source: 'POLYMARKET',
                    polymarketId: event.id,
                    polymarketVolume24hr: event.volume24hr || 0,
                },
                { upsert: true, new: true }
            );
        }

        await recalculateDegrees();
        console.log(`Polymarket sync done — ${events.length} topics upserted`);
    } catch (err) {
        console.error('Polymarket sync error:', err.message);
    }
};

// run once at startup then every 15mn
const startSyncJob = () => {
    syncPolymarket();
    setInterval(syncPolymarket, 15 * 60 * 1000);
};

module.exports = { startSyncJob };