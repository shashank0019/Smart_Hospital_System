import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-hero">
        <div className="hero-content">
          <h1>Smart Hospital System</h1>
          <p>Modern care, advanced technology, compassionate staff.</p>
          <a href="#contact" className="cta-button">Contact Us</a>
          <a href="/emergency" className="emergency-button">🚨 Emergency</a>
        </div>
        <img className="hero-image" src="https://images.unsplash.com/photo-1576765607925-9c2c7a3b1a6b?auto=format&fit=crop&w=800&q=80" alt="Modern hospital lobby with staff and patients" />
      </header>

      <section className="home-section why-section">
        <h2>Why Choose Us?</h2>
        <div className="why-cards">
          <div className="why-card">
            <span role="img" aria-label="doctor" className="why-icon">🩺</span>
            <h3>Expert Doctors</h3>
            <p>Our team includes top specialists in every field.</p>
          </div>
          <div className="why-card">
            <span role="img" aria-label="tech" className="why-icon">💻</span>
            <h3>Advanced Technology</h3>
            <p>State-of-the-art equipment for accurate diagnosis and treatment.</p>
          </div>
          <div className="why-card">
            <span role="img" aria-label="care" className="why-icon">🤝</span>
            <h3>Personalized Care</h3>
            <p>We treat every patient with empathy and respect.</p>
          </div>
        </div>
      </section>

      <section className="home-section features-section">
        <h2>Key Features</h2>
        <div className="features-cards">
          <div className="feature-card">
            <span role="img" aria-label="appointment" className="feature-icon">📅</span>
            <p>Online Appointment Booking</p>
          </div>
          <div className="feature-card">
            <span role="img" aria-label="emergency" className="feature-icon">🚑</span>
            <p>24/7 Emergency Services</p>
          </div>
          <div className="feature-card">
            <span role="img" aria-label="records" className="feature-icon">📋</span>
            <p>Digital Health Records</p>
          </div>
          <div className="feature-card">
            <span role="img" aria-label="pharmacy" className="feature-icon">💊</span>
            <p>In-house Pharmacy</p>
          </div>
        </div>
      </section>

      <section className="home-section gallery-section">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          <img src="https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&w=400&q=80" alt="Doctor with patient" className="gallery-img animate-fadein" />
          <img src="https://images.pexels.com/photos/2324837/pexels-photo-2324837.jpeg?auto=compress&w=400&q=80" alt="Medical team in hospital" className="gallery-img animate-fadein" />
          <img src="https://images.pexels.com/photos/708848/pexels-photo-708848.jpeg?auto=compress&w=400&q=80" alt="Hospital building" className="gallery-img animate-fadein" />
        </div>
      </section>

      <section className="home-section contact-section" id="contact">
        <h2>Contact Us</h2>
        <div className="contact-details">
          <div className="contact-item">
            <span className="contact-icon" role="img" aria-label="address">📍</span>
            <div>
              <strong>Address:</strong>
              <p>123 Health Avenue, Wellness City, 560001</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon" role="img" aria-label="phone">📞</span>
            <div>
              <strong>Helpline:</strong>
              <p>1800-123-4567 (24/7 Support)</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon" role="img" aria-label="email">✉️</span>
            <div>
              <strong>Email:</strong>
              <p>contact@smarthospital.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 