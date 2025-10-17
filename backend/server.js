const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Smart-Hospital-System')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/medicines', require('./routes/medicines'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for dev; restrict in production
    methods: ['GET', 'POST']
  }
});

// Store messages in memory for demo (replace with DB for production)
let chatHistory = {};

io.on('connection', (socket) => {
  // Join a room (doctor's email or ID)
  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    // Send chat history to the user
    socket.emit('chatHistory', chatHistory[room] || []);
  });

  // Handle sending messages
  socket.on('sendMessage', ({ room, sender, text }) => {
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push({ sender, text, timestamp: new Date() });
    io.to(room).emit('receiveMessage', { sender, text, timestamp: new Date() });
  });
});

// Replace app.listen with server.listen
server.listen(5000, () => {
  console.log('Server running on port 5000');
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
    EMAIL_USER: process.env.EMAIL_USER ? 'Configured' : 'Not configured'
  });
}); 