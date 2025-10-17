import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import { FaUserMd, FaPlusCircle } from 'react-icons/fa';
import MedicineInventory from './MedicineInventory';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    contactNumber: ''
  });
  const [summary, setSummary] = useState({
    doctors: 0
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    setSummary({
      doctors: doctors.length
    });
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error loading doctors');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/doctors', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        contactNumber: ''
      });
      fetchDoctors();
    } catch (err) {
      setError('Error adding doctor');
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDoctors();
      } catch (err) {
        setError('Error deleting doctor');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Management Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="summary-card">
          <FaUserMd size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>{summary.doctors}</h3>
          <span>Total Doctors</span>
        </div>
        <div className="summary-card" style={{ cursor: 'pointer' }} onClick={() => setShowAddForm(true)}>
          <FaPlusCircle size={32} color="#4f8cff" />
          <h3 style={{ margin: '10px 0 0 0' }}>Add</h3>
          <span>Add New Doctor</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="doctors-section">
        <div className="section-header">
          <h2>Doctors</h2>
        </div>

        <div className="doctors-list">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-header">
                <h3>{doctor.name}</h3>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(doctor._id)}
                >
                  Delete
                </button>
              </div>
              <div className="doctor-details">
                <p><strong>Email:</strong> {doctor.email}</p>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Experience:</strong> {doctor.experience} years</p>
                <p><strong>Contact:</strong> {doctor.contactNumber}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medicine Inventory Section */}
      <div className="medicine-inventory-section">
        <MedicineInventory />
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowAddForm(false)}>
              ×
            </button>
            <h2>Add New Doctor</h2>
            <form onSubmit={handleSubmit} className="doctor-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="experience">Experience (years)</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="add-button">
                Add Doctor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard; 