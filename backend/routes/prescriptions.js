const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { sendPrescriptionEmail } = require('../utils/emailService');

// Create prescription
router.post('/', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const { appointmentId, diagnosis, medications, instructions, followUpDate, additionalNotes } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    // if (appointment.doctor.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to create prescription for this appointment' });
    // }
    const prescription = new Prescription({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: req.user.id,
      diagnosis,
      medications,
      instructions,
      followUpDate,
      additionalNotes
    });
    await prescription.save();
    // Link prescription to appointment without triggering full validation
    await Appointment.updateOne(
      { _id: appointmentId },
      { $set: { prescription: prescription._id } }
    );
    // Optionally send email
    // await sendPrescriptionEmail(appointment.email, prescription);
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Error creating prescription' });
  }
});

// Get prescription by appointment ID (no authentication)
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    // Just fetch the appointment (no auth check)
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Error fetching prescription' });
  }
});

// Update prescription
router.put('/:id', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('patient', 'email');

    // Send updated prescription email
    await sendPrescriptionEmail(updatedPrescription.patient.email, updatedPrescription);

    res.json(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Error updating prescription' });
  }
});

// Delete prescription
router.delete('/:id', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this prescription' });
    }

    await prescription.remove();
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: 'Error deleting prescription' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Prescriptions route is working!' });
});

module.exports = router; 