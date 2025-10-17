import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Prescriptions.css';

const PrescriptionForm = ({ appointment, prescription, isEditing, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
    additionalNotes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && prescription) {
      setFormData({
        diagnosis: prescription.diagnosis || '',
        medications: prescription.medications || [{ name: '', dosage: '', frequency: '', duration: '' }],
        instructions: prescription.instructions || '',
        followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toISOString().split('T')[0] : '',
        additionalNotes: prescription.additionalNotes || ''
      });
    }
  }, [isEditing, prescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value
      };
      return {
        ...prev,
        medications: newMedications
      };
    });
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://localhost:5000/api/prescriptions/${prescription._id}`
        : 'http://localhost:5000/api/prescriptions';

      const method = isEditing ? 'put' : 'post';

      await axios[method](
        url,
        {
          ...formData,
          appointmentId: appointment._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
    } catch (error) {
      console.error('Error saving prescription:', error);
      setError(error.response?.data?.message || 'Error saving prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-form">
      <h2>{isEditing ? 'Edit Prescription' : 'Create Prescription'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="diagnosis">Diagnosis:</label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Medications:</label>
          {formData.medications.map((medication, index) => (
            <div key={index} className="medication-group">
              <div className="medication-row">
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    className="remove-medication"
                    onClick={() => removeMedication(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="add-medication" onClick={addMedication}>
            + Add Medication
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions:</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Provide clear instructions for medication use"
          />
        </div>

        <div className="form-group">
          <label htmlFor="followUpDate">Follow-up Date:</label>
          <input
            type="date"
            id="followUpDate"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="additionalNotes">Additional Notes:</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows="3"
            placeholder="Any additional notes or recommendations"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Prescription' : 'Create Prescription'}
          </button>
          <button type="button" className="cancel-button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm; 