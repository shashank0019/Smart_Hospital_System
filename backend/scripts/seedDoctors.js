const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User'); // Import the User model
const dotenv = require('dotenv');

dotenv.config();

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Smart-Hospital-System', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');

    // Clear existing doctors and users to avoid duplicates during testing
    await Doctor.deleteMany({});
    await User.deleteMany({ role: 'doctor' }); // Clear only doctor users
    console.log('Existing doctors and doctor-role users cleared.');

    const doctorsData = [
      {
        name: 'Dr. Alice Smith',
        email: 'alice.smith@example.com',
        password: 'password123',
        specialization: 'Pediatrics',
        experience: 10,
        qualification: 'MD',
        mobile: '9876543210',
        gender: 'Female', // Added for User model
        age: 40, // Added for User model
        bloodGroup: 'A+' // Added for User model
      },
      {
        name: 'Dr. Bob Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123',
        specialization: 'Cardiology',
        experience: 15,
        qualification: 'MBBS, FRCP',
        mobile: '9876543211',
        gender: 'Male',
        age: 45,
        bloodGroup: 'B+'
      },
      {
        name: 'Dr. Carol White',
        email: 'carol.white@example.com',
        password: 'password123',
        specialization: 'Dermatology',
        experience: 8,
        qualification: 'MD',
        mobile: '9876543212',
        gender: 'Female',
        age: 35,
        bloodGroup: 'O-'
      },
      {
        name: 'Dr. David Green',
        email: 'david.green@example.com',
        password: 'password123',
        specialization: 'Orthopedics',
        experience: 12,
        qualification: 'MS Ortho',
        mobile: '9876543213',
        gender: 'Male',
        age: 50,
        bloodGroup: 'AB+'
      },
      {
        name: 'Dr. Eve Brown',
        email: 'eve.brown@example.com',
        password: 'password123',
        specialization: 'Neurology',
        experience: 20,
        qualification: 'MD, PhD',
        mobile: '9876543214',
        gender: 'Female',
        age: 55,
        bloodGroup: 'B-'
      }
    ];

    for (const doctorData of doctorsData) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doctorData.password, salt);

      // Create User entry (password will be hashed by pre-save hook)
      const user = new User({
        name: doctorData.name.replace('Dr. ', ''), // Remove Dr. prefix for user name
        email: doctorData.email,
        password: doctorData.password, // Pass plain text password
        mobileNumber: doctorData.mobile,
        gender: doctorData.gender,
        age: doctorData.age,
        bloodGroup: doctorData.bloodGroup,
        role: 'doctor',
        specialization: doctorData.specialization
      });
      await user.save(); // This will trigger the pre('save') hook to hash the password
      console.log(`User ${user.name} (doctor) seeded.`);

      // Create Doctor entry (use the hashed password from the saved User)
      const doctor = new Doctor({
        name: doctorData.name,
        email: doctorData.email,
        password: user.password, // Use the hashed password from the User model
        specialization: doctorData.specialization,
        experience: doctorData.experience,
        qualification: doctorData.qualification,
        mobile: doctorData.mobile,
        role: 'doctor'
      });
      await doctor.save();
      console.log(`Doctor ${doctor.name} seeded.`);
    }

    console.log('All dummy doctors and corresponding users seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding doctors:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDoctors(); 