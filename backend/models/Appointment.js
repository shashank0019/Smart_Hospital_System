const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Indian mobile number format
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        // Allow today and future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return v >= today;
      },
      message: props => `${props.value} is not a valid date (must be today or in the future)!`
    }
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  // Patient Details fields
  chiefComplaint: { type: String },
  medicalHistory: { type: String },
  medicalHistoryOther: { type: String },
  familyHistory: { type: String },
  familyHistoryOther: { type: String },
  provisionalDiagnosis: { type: String },
  provisionalDiagnosisOther: { type: String },
  finalDiagnosis: { type: String },
  finalDiagnosisOther: { type: String },
  treatmentPlan: { type: String },
  treatmentPlanOther: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema); 