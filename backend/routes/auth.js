const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Management = require('../models/Management');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobileNumber, gender, age, bloodGroup, role, specialization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate required fields for doctors
    if (role === 'doctor' && !specialization) {
      return res.status(400).json({ message: 'Specialization is required for doctors' });
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      mobileNumber,
      gender,
      age,
      bloodGroup,
      role
    };

    // Add specialization only for doctors
    if (role === 'doctor') {
      userData.specialization = specialization;
    }

    const user = new User(userData);
    await user.save();

    let userId = user._id;
    let userRole = user.role;

    // If the user is a doctor, also create a Doctor entry
    if (role === 'doctor') {
      const doctorData = {
        name,
        email,
        password: user.password, // Use the hashed password from the User model
        specialization,
        qualification: 'N/A', // Assuming default or add to registration fields
        mobile: mobileNumber,
        role: 'doctor'
      };
      const doctor = new Doctor(doctorData);
      await doctor.save();
      userId = doctor._id; // Use doctor's ID for the token
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role: userRole },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    console.log('Comparing password for user:', user.email);
    const isMatch = await user.comparePassword(password);
    console.log('Password comparison result:', isMatch);
    if (!isMatch) {
      console.log('Login failed: Invalid password for user', user.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If it's a doctor, ensure a Doctor model entry exists and use its ID
    if (user.role === 'doctor') {
      let doctorProfile = await Doctor.findOne({ email: user.email });
      if (!doctorProfile) {
        console.warn(`Doctor profile for ${user.email} not found in Doctor collection. Creating one.`);
        doctorProfile = new Doctor({
          name: user.name,
          email: user.email,
          password: user.password, // This should be the hashed password
          specialization: user.specialization || 'General', // Default or get from user
          qualification: 'N/A',
          mobile: user.mobileNumber,
          role: 'doctor'
        });
        await doctorProfile.save();
      }

      // Use doctor's ID for the token
      const token = jwt.sign(
        { id: doctorProfile._id, role: 'doctor' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: doctorProfile._id,
          role: 'doctor',
          name: doctorProfile.name,
          email: doctorProfile.email
        }
      });
    }

    // If it's a management user
    if (user.role === 'management') {
      const managementProfile = await Management.findOne({ email: user.email });
      if (!managementProfile) {
        console.warn(`Management profile for ${user.email} not found in Management collection. This should not happen if seeded correctly.`);
        return res.status(500).json({ message: 'Management profile missing' });
      }

      const token = jwt.sign(
        { id: managementProfile._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: managementProfile._id,
          role: user.role,
          name: user.name,
          email: user.email
        }
      });
    }

    console.log('Login successful:', user.email);
    // For patients, use the Patient model's ID
    if (user.role === 'patient') {
      let patientProfile = await Patient.findOne({ email: user.email });
      if (!patientProfile) {
        console.warn(`Patient profile for ${user.email} not found in Patient collection. Creating one.`);
        patientProfile = new Patient({
          name: user.name,
          email: user.email,
          password: user.password, // This should be the hashed password
          mobileNumber: user.mobileNumber,
          gender: user.gender,
          age: user.age,
          bloodGroup: user.bloodGroup,
          role: 'patient'
        });
        await patientProfile.save();
      }
      const token = jwt.sign(
        { id: user._id, role: user.role }, // Use the User's _id for the token
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: patientProfile._id,
          role: user.role,
          name: patientProfile.name, // Use the name from Patient profile
          email: user.email
        }
      });
    }
    
    // For other roles (e.g., patient who doesn't have a separate Patient model or default fallback), use the User model's ID
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

module.exports = router; 