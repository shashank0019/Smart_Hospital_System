const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
require('dotenv').config();

const dummyDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    password: '123456',
    mobileNumber: '9876543210',
    gender: 'Female',
    age: 42,
    bloodGroup: 'A+',
    role: 'doctor',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)'
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@hospital.com',
    password: '123456',
    mobileNumber: '9876543211',
    gender: 'Male',
    age: 38,
    bloodGroup: 'B+',
    role: 'doctor',
    specialization: 'Neurology',
    qualification: 'MBBS, MD (Neurology)'
  },
  {
    name: 'Dr. Emily Brown',
    email: 'emily.brown@hospital.com',
    password: '123456',
    mobileNumber: '9876543212',
    gender: 'Female',
    age: 45,
    bloodGroup: 'O+',
    role: 'doctor',
    specialization: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics)'
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@hospital.com',
    password: '123456',
    mobileNumber: '9876543213',
    gender: 'Male',
    age: 50,
    bloodGroup: 'AB+',
    role: 'doctor',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics)'
  },
  {
    name: 'Dr. Lisa Patel',
    email: 'lisa.patel@hospital.com',
    password: '123456',
    mobileNumber: '9876543214',
    gender: 'Female',
    age: 35,
    bloodGroup: 'A-',
    role: 'doctor',
    specialization: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology)'
  },
  {
    name: 'Dr. Robert Kim',
    email: 'robert.kim@hospital.com',
    password: '123456',
    mobileNumber: '9876543215',
    gender: 'Male',
    age: 48,
    bloodGroup: 'B-',
    role: 'doctor',
    specialization: 'Ophthalmology',
    qualification: 'MBBS, MS (Ophthalmology)'
  },
  {
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@hospital.com',
    password: '123456',
    mobileNumber: '9876543216',
    gender: 'Female',
    age: 40,
    bloodGroup: 'O-',
    role: 'doctor',
    specialization: 'Gynecology',
    qualification: 'MBBS, MD (Gynecology)'
  },
  {
    name: 'Dr. David Lee',
    email: 'david.lee@hospital.com',
    password: '123456',
    mobileNumber: '9876543217',
    gender: 'Male',
    age: 55,
    bloodGroup: 'AB-',
    role: 'doctor',
    specialization: 'ENT',
    qualification: 'MBBS, MS (ENT)'
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@hospital.com',
    password: '123456',
    mobileNumber: '9876543218',
    gender: 'Female',
    age: 37,
    bloodGroup: 'A+',
    role: 'doctor',
    specialization: 'Psychiatry',
    qualification: 'MBBS, MD (Psychiatry)'
  },
  {
    name: 'Dr. Thomas Anderson',
    email: 'thomas.anderson@hospital.com',
    password: '123456',
    mobileNumber: '9876543219',
    gender: 'Male',
    age: 52,
    bloodGroup: 'B+',
    role: 'doctor',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD (General Medicine)'
  }
];

const createDummyDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_system');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await User.deleteMany({ role: 'doctor' });
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Create doctors
    for (const doctorData of dummyDoctors) {
      // Create user entry
      const user = new User(doctorData);
      await user.save();

      // Create doctor entry
      const doctor = new Doctor({
        name: doctorData.name,
        email: doctorData.email,
        password: user.password, // Use the hashed password from User model
        specialization: doctorData.specialization,
        qualification: doctorData.qualification,
        mobile: doctorData.mobileNumber,
        role: 'doctor'
      });
      await doctor.save();
      console.log(`Created doctor: ${doctorData.name}`);
    }

    console.log('Successfully created all dummy doctors');
    process.exit(0);
  } catch (error) {
    console.error('Error creating dummy doctors:', error);
    process.exit(1);
  }
};

createDummyDoctors(); 