import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login...');
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.token && response.data.user) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.name);
        
        console.log('Auth data stored:', {
          token: localStorage.getItem('token'),
          role: localStorage.getItem('role'),
          userId: localStorage.getItem('userId'),
          userName: localStorage.getItem('userName')
        });
        
        setIsAuthenticated(true);
        setUserRole(response.data.user.role);
        
        // Redirect based on role
        if (response.data.user.role === 'doctor') {
          navigate('/doctor/dashboard', { replace: true });
        } else if (response.data.user.role === 'patient') {
          navigate('/patient/dashboard', { replace: true });
        } else if (response.data.user.role === 'management') {
          navigate('/management/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <div className="demo-credentials">
          <p>Demo Doctor Account:</p>
          <p>Email: doctor@gmail.com</p>
          <p>Password: 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 