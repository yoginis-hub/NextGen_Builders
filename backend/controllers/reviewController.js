const Employee = require('../models/Employee');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getPendingReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Employee.countDocuments({ status: 'pending' });
  const employees = await Employee.find({ status: 'pending' })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-resumeText');

  res.status(200).json({
    success: true,
    data: employees,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
});

exports.approveEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, modifications } = req.body;

  const employee = await Employee.findById(id);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Apply any modifications from HR
  if (modifications) {
    const allowedMods = ['name', 'role', 'location', 'skills', 'projects', 'certifications', 'previousCompanies', 'summary'];
    allowedMods.forEach(field => {
      if (modifications[field] !== undefined) employee[field] = modifications[field];
    });
  }

  employee.status = 'approved';
  employee.reviewedBy = req.user.id;
  employee.reviewedAt = new Date();
  employee.reviewNotes = notes || '';
  await employee.save();

  // Update review record
  await Review.findOneAndUpdate(
    { employeeId: id, status: 'pending' },
    { status: 'approved', reviewedBy: req.user.id, reviewedAt: new Date(), notes: notes || '' },
    { sort: { createdAt: -1 } }
  );

  res.status(200).json({ success: true, message: 'Employee profile approved', data: employee });
});

exports.rejectEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const employee = await Employee.findById(id);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  employee.status = 'rejected';
  employee.reviewedBy = req.user.id;
  employee.reviewedAt = new Date();
  employee.reviewNotes = notes || '';
  await employee.save();

  await Review.findOneAndUpdate(
    { employeeId: id, status: 'pending' },
    { status: 'rejected', reviewedBy: req.user.id, reviewedAt: new Date(), notes: notes || '' },
    { sort: { createdAt: -1 } }
  );

  res.status(200).json({ success: true, message: 'Employee profile rejected', data: employee });
});

exports.getReviewHistory = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('employeeId', 'name email role')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ success: true, data: reviews });
});
