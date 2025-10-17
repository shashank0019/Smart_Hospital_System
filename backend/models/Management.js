const mongoose = require('mongoose');

const managementSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['management'],
    default: 'management'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Management', managementSchema); 