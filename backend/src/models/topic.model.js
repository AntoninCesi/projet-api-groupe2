const mongoose = require('mongoose');
const { Schema } = mongoose;

const topicSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    tags: { type: [String], default: [] },
    source: { type: String, enum: ['POLYMARKET', 'COMMUNITY'], required: true },
    polymarketId: { type: String, default: null },
    polymarketVolume24hr: { type: Number, default: 0},
    internalHeat: { type: Number, default: 0 },
    externalHeat: { type: Number, default: 0 },
    degree: { type: Number, default: 0 },
    isOnFire: { type: Boolean, default: false },
    variationPct: { type: Number, default: 0 },
    isOfficial: { type: Boolean, default: false },
    postsCount: { type: Number, default: 0 },
    participantsCount: { type: Number, default: 0 },
    // snapshots de chaleur pour les sparklines : { t: unix s, p: degree 0..100 }
    history: {
        type: [{ t: Number, p: Number, _id: false }],
        default: [],
    },
}, { timestamps: true });

// Unicité du polymarketId UNIQUEMENT pour les vrais ids (string).
// Un index partiel évite la collision entre topics COMMUNITY (polymarketId null).
topicSchema.index(
    { polymarketId: 1 },
    { unique: true, partialFilterExpression: { polymarketId: { $type: 'string' } } }
);

module.exports = mongoose.model('Topic', topicSchema);