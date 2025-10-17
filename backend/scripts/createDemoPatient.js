const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDemoPatient = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_system');
    console.log('Connected to MongoDB');

    // Check if patient exists
    let patient = await User.findOne({ email: 'vv88610705@gmail.com' });
    
    if (!patient) {
      // Create new patient
      patient = new User({
        name: 'Demo Patient',
        email: 'vv88610705@gmail.com',
        password: '123456',
        mobileNumber: '9876543210',
        gender: 'Male',
        age: 25,
        bloodGroup: 'O+',
        role: 'patient'
      });
      await patient.save();
      console.log('Demo patient created successfully');
    } else {
      console.log('Patient already exists');
    }

    console.log('Patient setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo patient:', error);
    process.exit(1);
  }
};

createDemoPatient(); 