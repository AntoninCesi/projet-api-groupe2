const Topic = require('../models/topic.model');
const Activity = require('../models/activity.model');
const Post = require('../models/post.model');

const POLYMARKET_URL = 'https://gamma-api.polymarket.com/events?active=true&closed=false&order=volume24hr&ascending=false&limit=100';
const POLYMARKET_TIMEOUT_MS = 10000;     // coupe le fetch s'il pend (réseau lent/bloqué)
const SYNC_INTERVAL_MS = 15 * 60 * 1000; // resynchro toutes les 15 min
const SYNC_FIRST_DELAY_MS = 60 * 1000;   // 1re synchro décalée: le serveur répond tout de suite

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
        // fetch borné par un timeout: sinon il peut pendre indéfiniment (fetch n'a pas de timeout par défaut)
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), POLYMARKET_TIMEOUT_MS);
        let events;
        try {
            const res = await fetch(POLYMARKET_URL, { signal: controller.signal });
            events = await res.json();
        } finally {
            clearTimeout(timer);
        }

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

// première synchro décalée puis toutes les 15mn.
// ENABLE_SYNC=false coupe la synchro (utile en dev: évite les rafales à chaque restart nodemon).
const startSyncJob = () => {
    if (process.env.ENABLE_SYNC === 'false') {
        console.log('Polymarket sync disabled (ENABLE_SYNC=false)');
        return;
    }
    setTimeout(syncPolymarket, SYNC_FIRST_DELAY_MS);
    setInterval(syncPolymarket, SYNC_INTERVAL_MS);
};

module.exports = { startSyncJob };