const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
const searchRoutes = require('./routes/search');
const teamBuilderRoutes = require('./routes/teamBuilder');
const importRoutes = require('./routes/import');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/team-builder', teamBuilderRoutes);
app.use('/api/import', importRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'SkillSync AI API' });
});

// Error handler
app.use(errorHandler);

// MongoDB connection
const runMigrations = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    // Drop broken companyEmail index if it exists (was created with null default)
    const indexes = await usersCol.indexes();
    if (indexes.find(i => i.name === 'companyEmail_1')) {
      await usersCol.dropIndex('companyEmail_1');
      console.log('🔧 Dropped broken companyEmail index');
    }

    // Unset companyEmail: null from all existing users so sparse index works correctly
    const result = await usersCol.updateMany(
      { companyEmail: null },
      { $unset: { companyEmail: '' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🔧 Cleaned companyEmail null from ${result.modifiedCount} user(s)`);
    }
  } catch (err) {
    console.warn('⚠️  Migration warning:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync_ai');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await runMigrations();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SkillSync AI Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
