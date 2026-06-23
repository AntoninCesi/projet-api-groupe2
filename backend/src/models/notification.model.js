const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: ['MENTION', 'LIKE', 'FOLLOW', 'REPOST', 'NEW_POST', 'TOPIC_ON_FIRE'], required: true},
    sourceType: { type: String, required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);