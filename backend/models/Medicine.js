const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  expiryDate: { type: Date, required: true }
});

module.exports = mongoose.model('Medicine', medicineSchema); 