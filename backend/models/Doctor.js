const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
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
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    default: 'doctor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema); 