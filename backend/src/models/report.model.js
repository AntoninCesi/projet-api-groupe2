const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    reason: { type: String, required: true, maxlength: 280 },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);