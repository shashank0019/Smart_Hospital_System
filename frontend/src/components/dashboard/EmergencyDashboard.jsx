import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Dashboard.css';

const SOCKET_URL = 'http://localhost:5000';

const EmergencyDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatDoctor, setChatDoctor] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const socketRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/doctors/emergency');
        setDoctors(res.data);
      } catch (err) {
        setError('Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

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
    <div className="emergency-dashboard-container">
      <h1 className="emergency-title">🚨 Emergency Dashboard</h1>
      <section className="first-aid-section">
        <h2>First Aid Information</h2>
        <ul className="first-aid-list">
          <li className="first-aid-item"><strong>CPR (Cardiopulmonary Resuscitation):</strong> If someone is unresponsive and not breathing, call emergency services and start chest compressions immediately.</li>
          <li className="first-aid-item"><strong>Bleeding:</strong> Apply firm pressure to the wound with a clean cloth. Keep the injured area elevated if possible.</li>
          <li className="first-aid-item"><strong>Burns:</strong> Cool the burn under running water for at least 10 minutes. Do not apply ice or creams.</li>
          <li className="first-aid-item"><strong>Fractures:</strong> Immobilize the injured area. Do not attempt to realign bones. Seek medical help.</li>
          <li className="first-aid-item"><strong>Choking:</strong> If the person cannot breathe, cough, or speak, perform abdominal thrusts (Heimlich maneuver).</li>
        </ul>
      </section>
      <section className="urgent-doctors-section">
        <h2>Urgent Doctor Contacts</h2>
        {loading ? (
          <div>Loading doctors...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : doctors.length === 0 ? (
          <div>No emergency/trauma doctors found.</div>
        ) : (
          <div className="doctor-cards">
            {doctors.map((doc, idx) => (
              <div className="doctor-card" key={idx}>
                <span className="doctor-icon" role="img" aria-label="doctor">👨‍⚕️</span>
                <div>
                  <strong>{doc.name}</strong> <br />
                  <span>{doc.specialization}</span>
                  <div>📞 <a href={`tel:${doc.contactNumber || doc.mobile || ''}`}>{doc.contactNumber || doc.mobile || 'N/A'}</a></div>
                  <div>✉️ <a href={`mailto:${doc.email}`}>{doc.email}</a></div>
                  <div className="doctor-actions">
                    <button className="chat-btn" onClick={() => handleOpenChat(doc)}>Chat</button>
                    <a className="call-btn" href={`tel:${doc.contactNumber || doc.mobile || ''}`}>Call</a>
                    <a className="video-btn" href={`mailto:${doc.email}?subject=Video Call Request`}>Video Call</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
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
      <div className="back-home-link">
        <a href="/" className="cta-button">Back to Home</a>
      </div>
    </div>
  );
};

export default EmergencyDashboard; 