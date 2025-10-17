const mongoose = require('mongoose');

const patientDetailsSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  chiefComplaint: { type: String },
  medicalHistory: { type: String },
  medicalHistoryOther: { type: String },
  familyHistory: { type: String },
  familyHistoryOther: { type: String },
  clinicalFindings: { type: String },
  provisionalDiagnosis: { type: String },
  provisionalDiagnosisOther: { type: String },
  investigations: { type: String },
  investigationsOther: { type: String },
  finalDiagnosis: { type: String },
  finalDiagnosisOther: { type: String },
  treatmentPlan: { type: String },
  treatmentPlanOther: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('PatientDetails', patientDetailsSchema); 