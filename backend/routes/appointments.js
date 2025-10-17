console.log('Appointments router file loaded!');
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const PatientDetails = require('../models/PatientDetails');
const { sendAppointmentEmail } = require('../utils/emailService');

// Temporary test route to check if router is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Appointments router test successful!' });
});

// Get all doctors (for patient to select from)
router.get('/doctors', auth, checkRole(['patient']), async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('name specialization experience contactNumber email')
      .sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Get doctor's appointments
router.get('/doctor', auth, checkRole(['doctor']), async (req, res) => {
  try {
    console.log('Fetching appointments for doctor:', req.user.email); // Debug log

    // First find the doctor using the user ID
    const doctor = await Doctor.findOne({ email: req.user.email });
    
    if (!doctor) {
      console.log('Doctor not found for email:', req.user.email); // Debug log
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('Found doctor:', doctor._id); // Debug log

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email mobileNumber')
      .populate('doctor', 'name specialization')
      .populate({
        path: 'prescription',
        populate: {
          path: 'doctor patient',
          select: 'name specialization email mobileNumber'
        }
      })
      .sort({ date: -1 });

    console.log('Found appointments:', appointments.length); // Debug log
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Get all appointments for a patient
router.get('/patient', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialization')
      .populate('prescription')
      .sort({ createdAt: 1 }); // fallback to createdAt if date/appointmentDate is inconsistent

    // Normalize the data for frontend
    const normalized = appointments.map(app => ({
      ...app._doc,
      appointmentDate: app.date || app.appointmentDate,
      appointmentTime: app.appointmentTime || (app.date ? new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined),
      reasonForVisit: app.reason || app.reasonForVisit,
    }));

    res.json(normalized);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctor, date, reason, patientName, age, gender, bloodGroup, mobile, email } = req.body;
    
    if (!doctor || !date || !reason || !patientName || !age || !gender || !bloodGroup || !mobile || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify the doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ message: 'Selected doctor not found' });
    }

    // Validate date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctor,
      date: appointmentDate,
      reason: reason,
      patientName,
      age,
      gender,
      bloodGroup,
      mobile,
      email,
      status: 'PENDING'
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({ message: 'Error creating appointment' });
  }
});

// Update appointment status
router.patch('/:id/status', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept appointment
router.put('/:id/accept', auth, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id).populate('doctor', 'name');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    appointment.status = 'ACCEPTED';
    await appointment.save();

    // Normalize data for email
    const appointmentDetails = {
      appointmentDate: appointment.date,
      appointmentTime: appointment.date ? new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      doctor: { name: appointment.doctor?.name || 'Unknown' },
      reasonForVisit: appointment.reason
    };

    await sendAppointmentEmail(
      appointment.email,
      'Appointment Accepted',
      appointmentDetails,
      'Accepted'
    );

    res.json(appointment);
  } catch (error) {
    console.error('Error accepting appointment:', error);
    res.status(500).json({ message: 'Error accepting appointment' });
  }
});

// Reject appointment
router.put('/:id/reject', auth, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id).populate('doctor', 'name');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    appointment.status = 'REJECTED';
    await appointment.save();

    // Normalize data for email
    const appointmentDetails = {
      appointmentDate: appointment.date,
      appointmentTime: appointment.date ? new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      doctor: { name: appointment.doctor?.name || 'Unknown' },
      reasonForVisit: appointment.reason
    };

    await sendAppointmentEmail(
      appointment.email,
      'Appointment Rejected',
      appointmentDetails,
      'Rejected'
    );

    res.json(appointment);
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: 'Error rejecting appointment' });
  }
});

// Create or update patient details for an appointment
router.post('/:id/patient-details', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const data = req.body;
    let details = await PatientDetails.findOne({ appointment: appointmentId });
    if (details) {
      Object.assign(details, data);
      await details.save();
    } else {
      details = new PatientDetails({ appointment: appointmentId, ...data });
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get patient details for an appointment
router.get('/:id/patient-details', auth, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const details = await PatientDetails.findOne({ appointment: appointmentId });
    if (!details) return res.status(404).json({ message: 'No patient details found' });
    res.json(details);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single appointment by ID (for prescription form)
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment' });
  }
});

module.exports = router; 