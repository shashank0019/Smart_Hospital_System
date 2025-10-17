import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated, userRole, setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // Force redirect to login
    navigate('/login', { replace: true });
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const handleNavigation = (path) => {
    navigate(path, { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span onClick={() => handleNavigation('/')} style={{ cursor: 'pointer' }}>
          Smart Hospital System
        </span>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <span className="welcome-text">
              Welcome, {localStorage.getItem('userName') || (userRole === 'doctor' ? 'Doctor' : userRole === 'patient' ? 'Patient' : 'Management')}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => handleNavigation('/login')} className="nav-btn nav-btn-login">
              Login
            </button>
            <button onClick={() => handleNavigation('/register')} className="nav-btn nav-btn-register">
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 