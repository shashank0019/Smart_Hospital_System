import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookAppointment from '../appointments/BookAppointment';
import AppointmentHistory from '../appointments/AppointmentHistory';
import './Dashboard.css';
import { io } from 'socket.io-client';
import { FaUserMd, FaCalendarAlt, FaHistory } from 'react-icons/fa';

const SOCKET_URL = 'http://localhost:5000';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('book');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorError, setDoctorError] = useState('');
  const [chatDoctor, setChatDoctor] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const socketRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [summary, setSummary] = useState({
    upcoming: 0,
    doctors: 0,
    history: 0
  });

  useEffect(() => {
    if (activeTab === 'doctors' && doctors.length === 0) {
      fetchDoctors();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  useEffect(() => {
    // Fetch summary stats (mocked for now, replace with real API if available)
    setSummary({
      upcoming: 2, // Replace with real count
      doctors: doctors.length,
      history: 5 // Replace with real count
    });
  }, [doctors]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    setDoctorError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/appointments/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      setDoctorError('Error fetching doctors.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // Force redirect to login
    navigate('/login', { replace: true });
  };

  // Handle chat modal open
  const handleOpenChat = (doctor) => {
    if (!userName) {
      setShowNamePrompt(true);
      setChatDoctor(doctor);
      return;
    }
    openChatWithDoctor(doctor);
  };

  // Open chat and connect to Socket.IO
  const openChatWithDoctor = (doctor) => {
    setChatDoctor(doctor);
    setChatHistory([]);
    setChatMessage('');
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    socketRef.current.emit('joinRoom', { room: doctor.email });
    socketRef.current.on('chatHistory', (history) => {
      setChatHistory(history);
    });
    socketRef.current.on('receiveMessage', (msg) => {
      setChatHistory((prev) => [...prev, msg]);
    });
  };

  // Cleanup socket on close
  const handleCloseChat = () => {
    setChatDoctor(null);
    setChatHistory([]);
    setChatMessage('');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (chatMessage.trim() && chatDoctor && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        room: chatDoctor.email,
        sender: userName || 'Anonymous',
        text: chatMessage
      });
      setChatMessage('');
    }
  };

  // Handle name prompt
  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowNamePrompt(false);
    if (chatDoctor) {
      openChatWithDoctor(chatDoctor);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="summary-card">
          <FaCalendarAlt size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.upcoming}</h3>
          <span>Upcoming Appointments</span>
        </div>
        <div className="summary-card">
          <FaUserMd size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.doctors}</h3>
          <span>Total Doctors</span>
        </div>
        <div className="summary-card">
          <FaHistory size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.history}</h3>
          <span>Appointment History</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          Book Appointment
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Appointment History
        </button>
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Our Doctors
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'book' ? (
          <BookAppointment />
        ) : activeTab === 'history' ? (
          <AppointmentHistory />
        ) : (
          <div>
            <h2>Our Doctors</h2>
            {loadingDoctors ? (
              <div className="loading">Loading doctors...</div>
            ) : doctorError ? (
              <div className="error-message">{doctorError}</div>
            ) : (
              <div className="doctors-list">
                {doctors.length === 0 ? (
                  <div>No doctors found.</div>
                ) : (
                  doctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-card">
                      <div className="doctor-header">
                        <h3>{doctor.name}</h3>
                      </div>
                      <div className="doctor-details">
                        <p><strong>Specialization:</strong> {doctor.specialization}</p>
                        {doctor.experience && <p><strong>Experience:</strong> {doctor.experience} years</p>}
                        {doctor.qualification && <p><strong>Qualification:</strong> {doctor.qualification}</p>}
                        {doctor.contactNumber && <p><strong>Contact:</strong> {doctor.contactNumber}</p>}
                        {doctor.email && <p><strong>Email:</strong> {doctor.email}</p>}
                        <button className="chat-btn" onClick={() => handleOpenChat(doctor)}>Message</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {/* Chat Modal and Name Prompt */}
        {showNamePrompt && (
          <div className="chat-modal">
            <div className="chat-modal-content">
              <h3>Enter Your Name</h3>
              <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="chat-input"
                />
                <button className="send-chat-btn" type="submit">Start Chat</button>
              </form>
            </div>
          </div>
        )}
        {chatDoctor && !showNamePrompt && (
          <div className="chat-modal">
            <div className="chat-modal-content">
              <span className="close-chat" onClick={handleCloseChat}>&times;</span>
              <h3>Chat with {chatDoctor.name}</h3>
              <div className="chat-history">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={msg.sender === userName ? 'chat-msg user' : 'chat-msg doctor'}>
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="chat-input"
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                />
                <button className="send-chat-btn" onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard; 