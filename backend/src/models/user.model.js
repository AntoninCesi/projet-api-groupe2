const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true // hashé avant save, jamais en clair
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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);