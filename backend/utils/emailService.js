const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendAppointmentEmail = async (to, subject, appointmentDetails, status) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Appointment ${status}</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #3498db;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${new Date(appointmentDetails.appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointmentDetails.appointmentTime}</p>
            <p><strong>Doctor:</strong> Dr. ${appointmentDetails.doctor.name}</p>
            <p><strong>Reason:</strong> ${appointmentDetails.reasonForVisit}</p>
          </div>
          <p style="color: #7f8c8d;">
            ${status === 'Accepted' 
              ? 'Your appointment has been confirmed. Please arrive 10 minutes before your scheduled time.'
              : 'We regret to inform you that your appointment request could not be accommodated at this time. Please try booking another slot.'}
          </p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 0.9em;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendPrescriptionEmail = async (to, prescription) => {
  const subject = 'Your Prescription';
  const medicationsList = prescription.medications.map(med => 
    `${med.name} - ${med.dosage}, ${med.frequency}, for ${med.duration}`
  ).join('\n');

  const text = `
    Your prescription details:
    
    Diagnosis: ${prescription.diagnosis}
    
    Medications:
    ${medicationsList}
    
    Instructions: ${prescription.instructions}
    
    Follow-up Date: ${prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'Not specified'}
    
    Additional Notes: ${prescription.additionalNotes || 'None'}
    
    Prescribed by: Dr. ${prescription.doctor.name}
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

const sendWelcomeEmail = async (to, name, email, password) => {
  const subject = 'Welcome to Smart Hospital System - Your Doctor Account Details';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Welcome, Dr. ${name}!</h2>
      <p>Your account has been successfully created in the Smart Hospital System.</p>
      <p>Here are your login credentials:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Please keep these credentials secure. You can log in to your dashboard here:</p>
      <p><a href="http://localhost:3000/login" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to your Dashboard</a></p>
      <p style="color: #7f8c8d;">If you have any questions, please contact the administration.</p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #7f8c8d; font-size: 0.9em;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${to}:`, error);
  }
};

module.exports = {
  sendAppointmentEmail,
  sendPrescriptionEmail,
  sendWelcomeEmail
}; 