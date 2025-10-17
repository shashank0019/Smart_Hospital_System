import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Prescriptions.css';

const PrescriptionView = ({ appointmentId, onEdit, onDelete, isDoctor }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescription();
  }, [appointmentId]);

  const fetchPrescription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/prescriptions/appointment/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('PrescriptionView fetched:', response.data);
      setPrescription(response.data);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      setError('Error loading prescription');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .medication-item {
              margin-bottom: 10px;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .footer {
              margin-top: 50px;
              text-align: right;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Prescription</h1>
          </div>
          
          <div class="section">
            <div class="section-title">Patient Information:</div>
            <p>Name: ${prescription.patient?.name || prescription.appointment?.patientName || 'Unknown'}</p>
            <p>Date: ${new Date(prescription.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Diagnosis:</div>
            <p>${prescription.diagnosis}</p>
          </div>

          <div class="section">
            <div class="section-title">Medications:</div>
            ${Array.isArray(prescription.medications) 
              ? prescription.medications.map(med => `
                <div class="medication-item">
                  <p><strong>Name:</strong> ${med.name}</p>
                  <p><strong>Dosage:</strong> ${med.dosage}</p>
                  <p><strong>Frequency:</strong> ${med.frequency}</p>
                  <p><strong>Duration:</strong> ${med.duration}</p>
                </div>
              `).join('')
              : `<p>${prescription.medications}</p>`
            }
          </div>

          <div class="section">
            <div class="section-title">Instructions:</div>
            <p>${prescription.instructions}</p>
          </div>

          <div class="section">
            <div class="section-title">Follow-up Date:</div>
            <p>${new Date(prescription.followUpDate).toLocaleDateString()}</p>
          </div>

          ${prescription.additionalNotes ? `
            <div class="section">
              <div class="section-title">Additional Notes:</div>
              <p>${prescription.additionalNotes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Doctor: ${prescription.doctor.name}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="no-print">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="loading">Loading prescription...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!prescription) {
    return <div className="no-prescription">No prescription found for this appointment.</div>;
  }

  return (
    <div className="prescription-view">
      <div className="prescription-header">
        <h2>Prescription Details</h2>
        <div className="prescription-actions">
          <button className="print-button" onClick={handlePrint}>
            Print Prescription
          </button>
          {isDoctor && (
            <>
              <button className="edit-button" onClick={() => onEdit(prescription)}>
                Edit
              </button>
              <button className="delete-button" onClick={() => onDelete(prescription._id)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="prescription-content">
        <div className="prescription-section">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> {prescription.appointment?.patientName || prescription.patient?.name || 'Unknown'}</p>
          <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="prescription-section">
          <h3>Diagnosis</h3>
          <p>{prescription.diagnosis}</p>
        </div>

        <div className="prescription-section">
          <h3>Medications</h3>
          {Array.isArray(prescription.medications) ? (
            <div className="medication-list">
              {prescription.medications.map((medication, index) => (
                <div key={index} className="medication-item">
                  <p><strong>Name:</strong> {medication.name}</p>
                  <p><strong>Dosage:</strong> {medication.dosage}</p>
                  <p><strong>Frequency:</strong> {medication.frequency}</p>
                  <p><strong>Duration:</strong> {medication.duration}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>{prescription.medications}</p>
          )}
        </div>

        <div className="prescription-section">
          <h3>Instructions</h3>
          <p>{prescription.instructions}</p>
        </div>

        <div className="prescription-section">
          <h3>Follow-up Date</h3>
          <p>{new Date(prescription.followUpDate).toLocaleDateString()}</p>
        </div>

        {prescription.additionalNotes && (
          <div className="prescription-section">
            <h3>Additional Notes</h3>
            <p>{prescription.additionalNotes}</p>
          </div>
        )}

        <div className="prescription-footer">
          <p><strong>Doctor:</strong> {prescription.doctor.name}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView; 