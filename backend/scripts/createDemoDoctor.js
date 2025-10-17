const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
require('dotenv').config();

const createDemoDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_system');
    console.log('Connected to MongoDB');

    // Check if demo doctor exists in User collection
    let demoUser = await User.findOne({ email: 'doctor@gmail.com' });
    
    if (!demoUser) {
      // Create demo doctor in User collection
      demoUser = new User({
        name: 'Demo Doctor',
        email: 'doctor@gmail.com',
        password: '123456',
        mobileNumber: '9876543210',
        gender: 'Male',
        age: 35,
        bloodGroup: 'O+',
        role: 'doctor',
        specialization: 'General Medicine'
      });
      await demoUser.save();
      console.log('Demo doctor created in User collection');
    }

    // Check if demo doctor exists in Doctor collection
    let demoDoctor = await Doctor.findOne({ email: 'doctor@gmail.com' });
    
    if (!demoDoctor) {
      // Create demo doctor in Doctor collection
      demoDoctor = new Doctor({
        name: 'Demo Doctor',
        email: 'doctor@gmail.com',
        password: demoUser.password,
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        mobile: '9876543210',
        role: 'doctor'
      });
      await demoDoctor.save();
      console.log('Demo doctor created in Doctor collection');
    }

    console.log('Demo doctor setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo doctor:', error);
    process.exit(1);
  }
};

createDemoDoctor(); 