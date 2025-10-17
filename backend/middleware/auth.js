const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Management = require('../models/Management');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware: Received token', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    console.log('Auth middleware: Decoded token', decoded);
    
    // Get user data based on role
    if (decoded.role === 'doctor') {
      const doctor = await Doctor.findById(decoded.id);
      if (!doctor) {
        console.log('Auth middleware: Doctor not found for ID', decoded.id);
        return res.status(401).json({ message: 'Doctor not found' });
      }
      req.user = {
        id: doctor._id,
        email: doctor.email,
        role: 'doctor'
      };
    } else if (decoded.role === 'management') {
      const management = await Management.findById(decoded.id);
      if (!management) {
        console.log('Auth middleware: Management user not found for ID', decoded.id);
        return res.status(401).json({ message: 'Management user not found' });
      }
      req.user = {
        id: management._id,
        email: management.email,
        role: 'management'
      };
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('Auth middleware: User not found for ID', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
    }
    console.log('Auth middleware: req.user set to', req.user);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('checkRole middleware: User role is', req.user?.role);
    console.log('checkRole middleware: Required roles are', roles);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, checkRole }; 