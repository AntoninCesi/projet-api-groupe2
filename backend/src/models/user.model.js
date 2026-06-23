const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true // hashed before save
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bio: {
    type: String,
    default: '',
    maxlength: 160
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['visitor', 'user', 'moderator', 'admin'],
    default: 'user'
  },
  status: { 
    type: String, enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isOfficialSource: {
    type: Boolean,
    default: false
  },
  karma: {
    type: Number,
    default: 0
  },
  degree: {
    type: Number,
    default: 0
  },
  following: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  followedTopics: {
    type: [Schema.Types.ObjectId],
    ref: 'Topic',
    default: []
  },
  // thèmes suivis = noms de catégories (ex: 'Politics', 'Sport')
  followedThemes: {
    type: [String],
    default: []
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);