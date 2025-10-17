const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');

// Get patient profile (protected route)
router.get('/profile', auth, checkRole(['patient']), async (req, res) => {
  try {
    const patient = await User.findById(req.user.userId).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient profile', error: error.message });
  }
});

// Example: Get all doctors (only for patients)
router.get('/doctors', auth, checkRole(['patient']), async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

module.exports = router; 