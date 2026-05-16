const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { asyncHandler } = require('../middleware/errorHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      companyEmail: user.companyEmail || undefined,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone || '',
      location: user.location || ''
    }
  });
};

exports.createHR = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role: 'hr' });

  res.status(201).json({
    success: true,
    message: 'HR account created successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role: role || 'employee' });

  // Create employee profile if role is employee
  if (user.role === 'employee') {
    await Employee.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      status: 'pending'
    });
  }

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ $or: [{ email }, { companyEmail: email }] }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  let employeeProfile = null;

  if (user.role === 'employee') {
    employeeProfile = await Employee.findOne({ userId: req.user.id });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      companyEmail: user.companyEmail || undefined,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone || '',
      location: user.location || '',
      lastLogin: user.lastLogin
    },
    employeeProfile
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, phone, location } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, avatar, phone, location },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, user });
});

exports.setCompanyEmail = asyncHandler(async (req, res) => {
  const { companyEmail } = req.body;
  if (!companyEmail) {
    return res.status(400).json({ success: false, message: 'Company email is required' });
  }
  const domain = '@skillsync.ai';
  if (!companyEmail.toLowerCase().endsWith(domain)) {
    return res.status(400).json({ success: false, message: `Company email must end with ${domain}` });
  }
  const taken = await User.findOne({ companyEmail: companyEmail.toLowerCase() });
  if (taken && taken._id.toString() !== req.user.id) {
    return res.status(400).json({ success: false, message: 'This company email is already assigned to another account' });
  }
  const normalizedEmail = companyEmail.toLowerCase();
  const user = await User.findByIdAndUpdate(req.user.id, { companyEmail: normalizedEmail }, { new: true });

  // Keep Employee record in sync so it shows everywhere in the app
  await Employee.findOneAndUpdate({ userId: req.user.id }, { email: normalizedEmail });

  res.status(200).json({ success: true, companyEmail: user.companyEmail });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  // Delete previous avatar file if it was one we stored
  const existing = await User.findById(req.user.id);
  if (existing?.avatar?.startsWith('/uploads/avatars/')) {
    const oldPath = path.join(__dirname, '..', existing.avatar);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true });
  res.status(200).json({ success: true, user, avatarUrl });
});
