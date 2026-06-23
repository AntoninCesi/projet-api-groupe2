const mongoose = require('mongoose');
const { Schema } = mongoose;

const activitySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['POST', 'LIKE', 'COMMENT', 'REPOST'], required: true},
    targetType: { type: String, required: true},
    targetId: { type: Schema.Types.ObjectId, required: true},
}, { timestamps: true});

module.exports = mongoose.model('Activity', activitySchema);