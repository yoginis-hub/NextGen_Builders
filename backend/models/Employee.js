const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Language', 'Framework', 'Database', 'DevOps', 'Cloud', 'Tool', 'Platform', 'Domain', 'Other'],
    default: 'Other'
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  yearsOfExperience: { type: Number, default: 0 },
  isInferred: { type: Boolean, default: false },
  inferredFrom: { type: String, default: null },
  confidenceScore: { type: Number, min: 0, max: 1, default: 1 }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  duration: { type: String, default: '' },
  role: { type: String, default: '' }
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  year: { type: Number, default: null },
  expiryYear: { type: Number, default: null }
}, { _id: true });

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  summary: { type: String, default: '' },
  totalYearsOfExperience: { type: Number, default: 0 },
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  previousCompanies: [{
    name: { type: String },
    role: { type: String },
    duration: { type: String },
    from: { type: String },
    to: { type: String }
  }],
  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: Number },
    field: { type: String }
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'on-leave', 'notice-period'],
    default: 'available'
  },
  availableFrom: { type: Date, default: null },
  resumeUrl: { type: String, default: null },
  resumeText: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: { type: Date, default: null },
  reviewNotes: { type: String, default: '' },
  avatar: { type: String, default: null },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for top skills
employeeSchema.virtual('topSkills').get(function() {
  return this.skills
    .filter(s => !s.isInferred)
    .sort((a, b) => {
      const levels = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
      return (levels[b.proficiency] || 0) - (levels[a.proficiency] || 0);
    })
    .slice(0, 5)
    .map(s => s.name);
});

// Index for search
employeeSchema.index({ 'skills.name': 1, location: 1, status: 1 });
employeeSchema.index({ name: 'text', role: 'text', 'skills.name': 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
