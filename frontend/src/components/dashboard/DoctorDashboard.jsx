import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PrescriptionForm from '../prescriptions/PrescriptionForm';
import PrescriptionView from '../prescriptions/PrescriptionView';
import './Dashboard.css';
import { io } from 'socket.io-client';
import { FaCalendarCheck, FaUserInjured, FaFilePrescription } from 'react-icons/fa';

const SOCKET_URL = 'http://localhost:5000';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState({
    name: '',
    specialization: '',
    email: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [chatRooms, setChatRooms] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const socketRef = useRef(null);
  const [summary, setSummary] = useState({
    today: 0,
    patients: 0,
    prescriptions: 0
  });
  const [showPatientDetailsForm, setShowPatientDetailsForm] = useState(false);
  const [showPatientDetailsView, setShowPatientDetailsView] = useState(false);
  const [patientDetails, setPatientDetails] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDoctorProfile();
    // Connect to Socket.IO for chat when Messages tab is active
    if (activeTab === 'messages' && doctorData.email) {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL);
        socketRef.current.emit('joinRoom', { room: doctorData.email });
        socketRef.current.on('chatHistory', (history) => {
          // Group messages by sender (patient)
          const grouped = {};
          history.forEach(msg => {
            const sender = msg.sender || 'Anonymous';
            if (!grouped[sender]) grouped[sender] = [];
            grouped[sender].push(msg);
          });
          setChatRooms(grouped);
        });
        socketRef.current.on('receiveMessage', (msg) => {
          setChatRooms(prev => {
            const sender = msg.sender || 'Anonymous';
            const updated = { ...prev };
            if (!updated[sender]) updated[sender] = [];
            updated[sender] = [...updated[sender], msg];
            return updated;
          });
        });
      }
    }
    // Cleanup on tab change or unmount
    return () => {
      if (socketRef.current && activeTab !== 'messages') {
        socketRef.current.disconnect();
        socketRef.current = null;
        setChatRooms({});
        setActiveChat(null);
      }
    };
    // eslint-disable-next-line
  }, [activeTab, doctorData.email]);

  useEffect(() => {
    // Calculate summary stats (mocked for now, replace with real API if available)
    setSummary({
      today: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length,
      patients: new Set(appointments.map(a => a.patient?.name)).size,
      prescriptions: appointments.filter(a => a.prescription).length
    });
  }, [appointments]);

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/doctors/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDoctorData(response.data);
      fetchAppointments();
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      setError('Error loading doctor profile');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/appointments/doctor', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Fetched appointments:', response.data); // Debug log
      setAppointments(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Error loading appointments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchAppointments();
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      setError(`Error ${action}ing appointment`);
    }
  };

  const handleCreatePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
    setIsEditing(false);
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionForm(true);
    setIsEditing(true);
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:5000/api/prescriptions/${prescriptionId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        fetchAppointments();
        setShowPrescriptionView(false);
      } catch (error) {
        console.error('Error deleting prescription:', error);
        setError('Error deleting prescription');
      }
    }
  };

  const handlePrescriptionSuccess = () => {
    setShowPrescriptionForm(false);
    setSelectedAppointment(null);
    setSelectedPrescription(null);
    setIsEditing(false);
    fetchAppointments();
  };

  const handlePrescriptionCancel = () => {
    setShowPrescriptionForm(false);
    setSelectedAppointment(null);
    setSelectedPrescription(null);
    setIsEditing(false);
  };

  const handleViewPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionView(true);
  };

  const handleClosePrescriptionView = () => {
    setShowPrescriptionView(false);
    setSelectedAppointment(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Invalid Time';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const renderAppointmentActions = (appointment) => {
    return (
      <div className="appointment-actions">
        {/* Accept/Reject buttons for pending appointments */}
        {appointment.status === 'PENDING' && (
          <>
            <button
              className="accept-button"
              onClick={() => handleAppointmentAction(appointment._id, 'accept')}
            >
              Accept
            </button>
            <button
              className="reject-button"
              onClick={() => handleAppointmentAction(appointment._id, 'reject')}
            >
              Reject
            </button>
          </>
        )}
        <button
          className="patient-details-button"
          onClick={() => {
            setSelectedAppointment(appointment);
            setShowPatientDetailsForm(true);
          }}
        >
          Patient Details
        </button>
        <button
          className="view-prescription-button"
          onClick={() => appointment.prescription ? handleViewPrescription(appointment) : null}
          disabled={!appointment.prescription}
          title={appointment.prescription ? 'View Prescription' : 'No prescription yet'}
        >
          View Prescription
        </button>
        {appointment.prescription ? (
          <>
            <button
              className="edit-prescription-button"
              onClick={() => handleEditPrescription(appointment.prescription)}
            >
              Edit Prescription
            </button>
            <button
              className="delete-prescription-button"
              onClick={() => handleDeletePrescription(appointment.prescription._id)}
            >
              Delete Prescription
            </button>
          </>
        ) : (
          <button
            className="create-prescription-button"
            onClick={() => handleCreatePrescription(appointment)}
          >
            Create Prescription
          </button>
        )}
        <button
          className="view-patient-details-button"
          onClick={() => {
            setSelectedAppointment(appointment);
            fetchPatientDetails(appointment._id);
          }}
        >
          View Patient Details
        </button>
      </div>
    );
  };

  // Utility to get display name with 'Dr.' only if not already present
  const getDoctorDisplayName = (name) => {
    if (!name) return '';
    return name.trim().toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
  };

  // Send message to patient
  const handleSendChatMessage = () => {
    if (chatMessage.trim() && activeChat && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        room: doctorData.email,
        sender: getDoctorDisplayName(doctorData.name),
        text: chatMessage
      });
      setChatMessage('');
    }
  };

  // Save patient details to backend
  const savePatientDetails = async (appointmentId, details) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/appointments/${appointmentId}/patient-details`,
        details,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPatientDetailsForm(false);
      setShowPatientDetailsView(true);
    } catch (error) {
      setError('Error saving patient details');
    }
  };

  // Fetch patient details from backend
  const fetchPatientDetails = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/appointments/${appointmentId}/patient-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientDetails(res.data);
      setShowPatientDetailsView(true);
    } catch (error) {
      setError('No patient details found');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{getDoctorDisplayName(doctorData.name)} Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="summary-card">
          <FaCalendarCheck size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.today}</h3>
          <span>Today's Appointments</span>
        </div>
        <div className="summary-card">
          <FaUserInjured size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.patients}</h3>
          <span>Total Patients</span>
        </div>
        <div className="summary-card">
          <FaFilePrescription size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.prescriptions}</h3>
          <span>Prescriptions Given</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={`tab-button ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          Patients
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        
        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <h2>Appointments</h2>
            {loading ? (
              <div className="loading">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="no-appointments">No appointments found.</div>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <h3>Appointment with {appointment.patientName || appointment.patient.name}</h3>
                      <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
                      <p><strong>Time:</strong> {formatTime(appointment.date)}</p>
                      <p><strong>Reason:</strong> {appointment.reason}</p>
                      <p><strong>Contact:</strong> {appointment.patient.mobileNumber}</p>
                      <p><strong>Email:</strong> {appointment.patient.email}</p>
                    </div>
                    {renderAppointmentActions(appointment)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="patients-section">
            <h2>Patient Management</h2>
            <p>Access and update patient health records here.</p>
            {/* Add patient management functionality here */}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-section">
            <h2>Messages</h2>
            <p>Communicate securely with your patients here.</p>
            <div className="doctor-chat-container">
              <div className="chat-room-list">
                <h4>Active Chats</h4>
                {Object.keys(chatRooms).length === 0 ? (
                  <div>No active chats.</div>
                ) : (
                  Object.keys(chatRooms).map((sender, idx) => (
                    <div
                      key={idx}
                      className={`chat-room-item${activeChat === sender ? ' active' : ''}`}
                      onClick={() => setActiveChat(sender)}
                    >
                      {sender}
                    </div>
                  ))
                )}
              </div>
              <div className="chat-room-window">
                {activeChat ? (
                  <>
                    <div className="chat-history">
                      {chatRooms[activeChat].map((msg, i) => (
                        <div key={i} className={msg.sender.startsWith('Dr.') ? 'chat-msg doctor' : 'chat-msg user'}>
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
                        onKeyDown={e => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      />
                      <button className="send-chat-btn" onClick={handleSendChatMessage}>Send</button>
                    </div>
                  </>
                ) : (
                  <div className="chat-placeholder">Select a chat to view messages.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPrescriptionForm && (selectedAppointment || selectedPrescription) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handlePrescriptionCancel}>×</button>
            <PrescriptionForm
              appointment={selectedAppointment}
              prescription={selectedPrescription}
              isEditing={isEditing}
              onSuccess={handlePrescriptionSuccess}
              onCancel={handlePrescriptionCancel}
            />
          </div>
        </div>
      )}

      {showPrescriptionView && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleClosePrescriptionView}>×</button>
            <PrescriptionView
              appointmentId={selectedAppointment._id}
              onEdit={handleEditPrescription}
              onDelete={handleDeletePrescription}
              isDoctor={true}
            />
          </div>
        </div>
      )}

      {showPatientDetailsForm && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowPatientDetailsForm(false)}>×</button>
            <h2>Patient Details</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                savePatientDetails(selectedAppointment._id, patientDetails);
              }}
              className="patient-details-form"
            >
              <div className="form-group">
                <label>Chief Complaint</label>
                <input
                  type="text"
                  value={patientDetails.chiefComplaint || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, chiefComplaint: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Medical History</label>
                <select
                  value={patientDetails.medicalHistory || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, medicalHistory: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Asthma">Asthma</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="If other, specify"
                  value={patientDetails.medicalHistoryOther || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, medicalHistoryOther: e.target.value })}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Family History</label>
                <select
                  value={patientDetails.familyHistory || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, familyHistory: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Heart Disease">Heart Disease</option>
                  <option value="Cancer">Cancer</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="If other, specify"
                  value={patientDetails.familyHistoryOther || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, familyHistoryOther: e.target.value })}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Clinical Findings</label>
                <input
                  type="text"
                  value={patientDetails.clinicalFindings || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, clinicalFindings: e.target.value })}
                  placeholder="Enter clinical findings"
                />
              </div>
              <div className="form-group">
                <label>Provisional Diagnosis</label>
                <select
                  value={patientDetails.provisionalDiagnosis || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, provisionalDiagnosis: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Infection">Infection</option>
                  <option value="Injury">Injury</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="If other, specify"
                  value={patientDetails.provisionalDiagnosisOther || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, provisionalDiagnosisOther: e.target.value })}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Investigations</label>
                <select
                  value={patientDetails.investigations || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, investigations: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="MRI">MRI</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="If other, specify"
                  value={patientDetails.investigationsOther || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, investigationsOther: e.target.value })}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Final Diagnosis</label>
                <select
                  value={patientDetails.finalDiagnosis || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, finalDiagnosis: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Confirmed Infection">Confirmed Infection</option>
                  <option value="Confirmed Injury">Confirmed Injury</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="If other, specify"
                  value={patientDetails.finalDiagnosisOther || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, finalDiagnosisOther: e.target.value })}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Treatment Plan</label>
                <select
                  value={patientDetails.treatmentPlan || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, treatmentPlan: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Medication">Medication</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Therapy">Therapy</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="If other, specify"
                  value={patientDetails.treatmentPlanOther || ''}
                  onChange={e => setPatientDetails({ ...patientDetails, treatmentPlanOther: e.target.value })}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">Save</button>
                <button type="button" className="cancel-button" onClick={() => setShowPatientDetailsForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPatientDetailsView && patientDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowPatientDetailsView(false)}>×</button>
            <h2>Patient Details</h2>
            <div className="patient-details-view">
              <p><strong>Chief Complaint:</strong> {patientDetails.chiefComplaint}</p>
              <p><strong>Medical History:</strong> {patientDetails.medicalHistory} {patientDetails.medicalHistoryOther && `(${patientDetails.medicalHistoryOther})`}</p>
              <p><strong>Family History:</strong> {patientDetails.familyHistory} {patientDetails.familyHistoryOther && `(${patientDetails.familyHistoryOther})`}</p>
              <p><strong>Clinical Findings:</strong> {patientDetails.clinicalFindings}</p>
              <p><strong>Provisional Diagnosis:</strong> {patientDetails.provisionalDiagnosis} {patientDetails.provisionalDiagnosisOther && `(${patientDetails.provisionalDiagnosisOther})`}</p>
              <p><strong>Investigations:</strong> {patientDetails.investigations} {patientDetails.investigationsOther && `(${patientDetails.investigationsOther})`}</p>
              <p><strong>Final Diagnosis:</strong> {patientDetails.finalDiagnosis} {patientDetails.finalDiagnosisOther && `(${patientDetails.finalDiagnosisOther})`}</p>
              <p><strong>Treatment Plan:</strong> {patientDetails.treatmentPlan} {patientDetails.treatmentPlanOther && `(${patientDetails.treatmentPlanOther})`}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard; 