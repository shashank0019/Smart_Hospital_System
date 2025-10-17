import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PrescriptionView from '../prescriptions/PrescriptionView';
import './Appointments.css';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/appointments/patient', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescription(true);
  };

  const handleClosePrescription = () => {
    setShowPrescription(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
    } catch (error) {
      setError('Error deleting appointment');
    }
  };

  const handleViewPatientDetails = async (appointment) => {
    try {
      const token = localStorage.getItem('token');
      // Try to fetch from backend in case not populated
      const res = await axios.get(`http://localhost:5000/api/appointments/${appointment._id}/patient-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPatientDetails(res.data);
      setShowPatientDetails(true);
    } catch (error) {
      setError('No patient details found');
    }
  };

  if (loading) {
    return (
      <div className="appointment-container">
        <div className="appointment-form-container">
          <h2>Loading appointments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-container">
      <div className="appointment-form-container">
        <h2>Appointment History</h2>
        {error && <div className="error-message">{error}</div>}
        
        {appointments.length === 0 ? (
          <p className="no-appointments">No appointments found.</p>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <h3>Dr. {(appointment.doctor && appointment.doctor.name) || 'Unknown Doctor'}</h3>
                  <span className={`status ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-details">
                  <p><strong>Patient Name:</strong> {appointment.patientName}</p>
                  <p><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</p>
                  <p><strong>Time:</strong> {formatTime(appointment.appointmentTime)}</p>
                  <p><strong>Reason:</strong> {appointment.reasonForVisit}</p>
                  {appointment.additionalNotes && (
                    <p><strong>Additional Notes:</strong> {appointment.additionalNotes}</p>
                  )}
                </div>
                <div className="appointment-actions">
                  {appointment.status !== 'ACCEPTED' && (
                    <button
                      className="delete-appointment-button"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                    >
                      Delete Appointment
                    </button>
                  )}
                  {appointment.status === 'ACCEPTED' && appointment.prescription && appointment.prescription._id && (
                    <button
                      className="view-prescription-button"
                      onClick={() => handleViewPrescription(appointment)}
                    >
                      View Prescription
                    </button>
                  )}
                  <button
                    className="view-patient-details-button"
                    onClick={() => handleViewPatientDetails(appointment)}
                  >
                    View Patient Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPrescription && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleClosePrescription}>
              ×
            </button>
            <PrescriptionView appointmentId={selectedAppointment._id} />
          </div>
        </div>
      )}
      {showPatientDetails && selectedPatientDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowPatientDetails(false)}>×</button>
            <h2>Patient Details</h2>
            <div>
              <p><strong>Chief Complaint:</strong> {selectedPatientDetails.chiefComplaint}</p>
              <p><strong>Medical History:</strong> {selectedPatientDetails.medicalHistory} {selectedPatientDetails.medicalHistoryOther && `(${selectedPatientDetails.medicalHistoryOther})`}</p>
              <p><strong>Family History:</strong> {selectedPatientDetails.familyHistory} {selectedPatientDetails.familyHistoryOther && `(${selectedPatientDetails.familyHistoryOther})`}</p>
              <p><strong>Provisional Diagnosis:</strong> {selectedPatientDetails.provisionalDiagnosis} {selectedPatientDetails.provisionalDiagnosisOther && `(${selectedPatientDetails.provisionalDiagnosisOther})`}</p>
              <p><strong>Final Diagnosis:</strong> {selectedPatientDetails.finalDiagnosis} {selectedPatientDetails.finalDiagnosisOther && `(${selectedPatientDetails.finalDiagnosisOther})`}</p>
              <p><strong>Treatment Plan:</strong> {selectedPatientDetails.treatmentPlan} {selectedPatientDetails.treatmentPlanOther && `(${selectedPatientDetails.treatmentPlanOther})`}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory; 