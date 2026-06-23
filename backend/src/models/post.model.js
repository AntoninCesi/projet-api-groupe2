const mongoose = require('mongoose');
const { Schema } = mongoose;

const replySchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 280 },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    replyTo: { type: Schema.Types.ObjectId, default: null },
}, { timestamps: true });

const commentSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 280 },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    replies: [replySchema],
}, { timestamps: true });

const postSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
    repostOf: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    content: { type: String, required: true, maxlength: 280 },
    tags: { type: [String], default: [] },
    media: { type: [{ type: { type: String }, url: String }], default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    comments: { type: [commentSchema], default: [] },
    shareCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);