const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get doctor profile
router.get('/profile', auth, function(req, res) {
  try {
    // Removed demo doctor specific logic, always fetch from DB
    Doctor.findById(req.user.id)
      .select('-password')
      .then(doctor => {
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
      })
      .catch(error => {
        console.error('Error fetching doctor profile:', error);
        res.status(500).json({ message: 'Error fetching doctor profile' });
      });
  } catch (error) {
    console.error('Error in doctor profile route:', error);
    res.status(500).json({ message: 'Error fetching doctor profile' });
  }
});

// Get all doctors (protected route - accessible by management)
router.get('/', auth, checkRole(['management']), async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new doctor (protected route - accessible by management)
router.post('/', auth, checkRole(['management']), async (req, res) => {
  try {
    const { name, email, password, specialization, experience, contactNumber } = req.body;

    // Check if doctor or user already exists
    let doctorExists = await Doctor.findOne({ email });
    let userExists = await User.findOne({ email });
    if (doctorExists || userExists) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Create User entry first (password will be hashed by User model pre-save hook)
    const user = new User({
      name: name,
      email: email,
      password: password, // Plain text password, User model pre-save hook will hash it
      mobileNumber: contactNumber, // Use contactNumber for mobileNumber
      gender: 'Prefer not to say', // Default or add to form
      age: 30, // Default or add to form
      bloodGroup: 'Unknown', // Default or add to form
      role: 'doctor',
      specialization: specialization
    });
    console.log('Attempting to save user:', user.email);
    await user.save();
    console.log('User saved successfully:', user.email, 'ID:', user._id);

    // Create new Doctor entry, using the hashed password from the saved User
    const doctor = new Doctor({
      name,
      email,
      password: user.password, // Use the hashed password from the User model
      specialization,
      experience,
      contactNumber,
      role: 'doctor'
    });

    await doctor.save();

    // Send welcome email to the new doctor (passing plain text password for the email content)
    await sendWelcomeEmail(email, name, email, password); 

    // Remove password from response for security
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(201).json(doctorResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete doctor (protected route - accessible by management)
router.delete('/:id', auth, checkRole(['management']), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await doctor.remove();
    res.json({ message: 'Doctor removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: Get all emergency/trauma doctors (no auth required)
router.get('/emergency', async (req, res) => {
  try {
    const doctors = await Doctor.find({
      $or: [
        { specialization: { $regex: /(emergency|trauma)/i } },
        { email: { $in: ['veereshasinganal@gmail.com', 'v633993@gmail.com'] } }
      ]
    }).select('name email specialization contactNumber');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 