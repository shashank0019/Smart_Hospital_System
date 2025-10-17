const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/medicines called. User:', req.user);
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    console.error('Error in GET /api/medicines:', err);
    res.status(500).json({ message: 'Error fetching medicines' });
  }
});

// Check stock for a specific medicine
router.get('/check/:name', async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ name: req.params.name });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ name: medicine.name, quantity: medicine.quantity, expiryDate: medicine.expiryDate });
  } catch (err) {
    res.status(500).json({ message: 'Error checking medicine stock' });
  }
});

// Add a new medicine
router.post('/', async (req, res) => {
  try {
    const { name, quantity, expiryDate } = req.body;
    if (!name || !quantity || !expiryDate) {
      return res.status(400).json({ message: 'Name, quantity, and expiryDate are required' });
    }
    const medicine = new Medicine({ name, quantity, expiryDate });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Medicine with this name already exists' });
    } else {
      res.status(500).json({ message: 'Error adding medicine' });
    }
  }
});

module.exports = router; 