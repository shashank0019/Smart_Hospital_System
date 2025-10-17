const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Management = require('../models/Management');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedManagement = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Smart-Hospital-System', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');

    // Clear existing management users and corresponding user entries
    await Management.deleteMany({});
    await User.deleteMany({ role: 'management' });
    console.log('Existing management users cleared.');

    // Create management user entry in User collection (password will be hashed by pre-save hook)
    const user = new User({
      name: 'Hospital Management',
      email: 'management@gmail.com',
      password: '123456',
      mobileNumber: '1112223333',
      gender: 'Other',
      age: 30,
      bloodGroup: 'O+',
      role: 'management'
    });
    await user.save();
    console.log(`User ${user.email} (management) seeded.`);

    // Create management user entry in Management collection
    const management = new Management({
      email: user.email,
      password: user.password,
      role: 'management'
    });

    await management.save();
    console.log('Management user seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding management user:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedManagement(); 