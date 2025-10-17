import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Appointments.css';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    mobile: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reasonForVisit: '',
    additionalNotes: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to book an appointment');
          return;
        }

        console.log('Fetching doctors...');
        const response = await axios.get('http://localhost:5000/api/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Doctors response:', response.data);
        if (response.data && response.data.length > 0) {
          setDoctors(response.data);
          console.log('Doctors set:', response.data);
        } else {
          setError('No doctors available at the moment');
          console.log('No doctors available');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        if (error.response?.status === 401) {
          setError('Please login to book an appointment');
        } else if (error.response?.status === 403) {
          setError('Only patients can book appointments');
        } else {
          setError('Error fetching doctors list. Please try again later.');
        }
      }
    };

    fetchDoctors();
  }, []);

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
      if (!token) {
        setError('Please login to book an appointment');
        return;
      }

      const decoded = jwtDecode(token);
      if (!decoded.id) {
        setError('Invalid user session. Please login again.');
        return;
      }

      // Combine date and time into a single ISO string
      const appointmentDateTime = new Date(
        `${formData.appointmentDate}T${formData.appointmentTime}`
      ).toISOString();
      
      const appointmentData = {
        doctor: formData.doctor,
        date: appointmentDateTime,
        reason: formData.reasonForVisit,
        patientName: formData.patientName,
        age: formData.age,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        mobile: formData.mobile,
        email: formData.email,
        patient: decoded.id
      };

      const response = await axios.post('http://localhost:5000/api/appointments', appointmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setSuccess('Appointment booked successfully!');
        setError('');
        setFormData({
          patientName: '',
          age: '',
          gender: '',
          bloodGroup: '',
          mobile: '',
          doctor: '',
          appointmentDate: '',
          appointmentTime: '',
          reasonForVisit: '',
          additionalNotes: '',
          email: ''
        });
      }
    } catch (error) {
      console.error('Appointment booking error:', error);
      const errorMessage = error.response?.data?.message || 'Error booking appointment';
      setError(errorMessage);
      setSuccess('');
    }
  };

  return (
    <div className="appointment-container">
      <div className="appointment-form-container">
        <h2>Book an Appointment</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              placeholder="Enter patient's full name"
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
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              placeholder="Enter age"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              pattern="[6-9][0-9]{9}"
              placeholder="Enter 10-digit mobile number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="doctor">Select Doctor</label>
            <select
              id="doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select Doctor</option>
              {doctors && doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading doctors...</option>
              )}
            </select>
            {doctors && doctors.length === 0 && (
              <div className="text-muted small mt-1">
                No doctors available. Please check back later.
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="appointmentDate">Appointment Date</label>
            <input
              type="date"
              id="appointmentDate"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="appointmentTime">Appointment Time</label>
            <input
              type="time"
              id="appointmentTime"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              min="09:00"
              max="17:00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reasonForVisit">Reason for Visit</label>
            <textarea
              id="reasonForVisit"
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button type="submit" className="appointment-button">Book Appointment</button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment; 