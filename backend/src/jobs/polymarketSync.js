const Topic = require('../models/topic.model');
const Acticity = require('../models/activity.model');

const POLYMARKET_URL = 'https://gamma-api.polymarket.com/events?active=true&closed=false&order=volume24hr&ascending=false&limit=100';

const logNorm = (val) => val > 0 ? Math.log(val + 1) : 0;

const recalculateDegrees = async () => {
    const topics = await Topic.find();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const topic of topics) {
        const activities = await Activity.find({
            targetId: { $in: [] },
            createdAt: { $gte: since},
        });

        const heatInt = logNorm(topic.postsCount);
        const heatExt = logNorm(topic.polymarketVolume24hr);

        const prevDegree = topic.degree;
        const wInt = topic.source === 'COMMUNITY' ? 1 : 0.6;
        const wExt = topic.source === 'COMMUNITY' ? 0 : 0.4;

        topic.degree = Math.min(100, Math.round(wInt * heatInt * 20 + wExt * heatExt * 20));
        topic.isOnFire = topic.degree >= 90;
        topic.variationPct = prevDegree > 0 ? Math.round(((topic.degree - prevDegree) / prevDegree) * 100) : 0;

        await topic.save();
    }
};

// fetch events from Polymarket and upsert Topics
const syncPolymarket = async () => {
    try {
        const res = await fetch(POLYMARKET_URL);
        const events = await res.json();

        for (const event of events) {
            await Topic.findOneAndUpdate (
                { polymarketId: event.id },
                {
                    title: event.title,
                    description: event.description || '',
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