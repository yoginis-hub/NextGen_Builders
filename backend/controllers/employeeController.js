const Employee = require('../models/Employee');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getAllEmployees = asyncHandler(async (req, res) => {
  const { status, availability, location, skills, sort, page = 1, limit = 20 } = req.query;

  let query = {};

  if (status) query.status = status;
  if (availability) query.availability = availability;
  if (location) query.location = new RegExp(location, 'i');
  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    query['skills.name'] = { $in: skillList.map(s => new RegExp(s, 'i')) };
  }

  // HR can see all, employees can only see approved profiles
  if (req.user.role === 'employee') {
    query.status = 'approved';
  }

  let sortObj = { createdAt: -1 };
  if (sort === 'experience') sortObj = { totalYearsOfExperience: -1 };
  if (sort === 'name') sortObj = { name: 1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Employee.countDocuments(query);
  const employees = await Employee.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'name companyEmail avatar')
    .select('-resumeText')
    .lean();

  const data = employees.map(emp => ({
    ...emp,
    email: emp.userId?.companyEmail || emp.email,
    avatar: emp.avatar || emp.userId?.avatar || null,
  }));

  res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('userId', 'name companyEmail avatar lastLogin')
    .populate('reviewedBy', 'name email')
    .lean();

  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Employees can only see approved profiles (not their own)
  if (req.user.role === 'employee' && employee.status !== 'approved' && employee.userId?._id?.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const data = {
    ...employee,
    email: employee.userId?.companyEmail || employee.email,
    avatar: employee.avatar || employee.userId?.avatar || null,
  };

  res.status(200).json({ success: true, data });
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user.id })
    .populate('userId', 'companyEmail avatar')
    .lean();
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Profile not found. Please upload your resume.' });
  }
  const data = {
    ...employee,
    email: employee.userId?.companyEmail || employee.email,
    avatar: employee.avatar || employee.userId?.avatar || null,
  };
  res.status(200).json({ success: true, data });
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);

  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Employees can only update their own profile
  if (req.user.role === 'employee' && employee.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const allowedFields = req.user.role === 'hr'
    ? ['name', 'role', 'location', 'phone', 'summary', 'skills', 'projects', 'certifications', 'previousCompanies', 'education', 'availability', 'availableFrom', 'linkedIn', 'github', 'portfolio', 'avatar']
    : ['phone', 'location', 'summary', 'skills', 'availability', 'availableFrom', 'linkedIn', 'github', 'portfolio', 'avatar'];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updated = await Employee.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  await employee.deleteOne();
  res.status(200).json({ success: true, message: 'Employee deleted successfully' });
});

exports.getStats = asyncHandler(async (req, res) => {
  const [total, approved, pending, rejected] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'approved' }),
    Employee.countDocuments({ status: 'pending' }),
    Employee.countDocuments({ status: 'rejected' })
  ]);

  // Top skills aggregation
  const topSkillsAgg = await Employee.aggregate([
    { $match: { status: 'approved' } },
    { $unwind: '$skills' },
    { $match: { 'skills.isInferred': false } },
    { $group: { _id: '$skills.name', count: { $sum: 1 }, category: { $first: '$skills.category' } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Location distribution
  const locationAgg = await Employee.aggregate([
    { $match: { status: 'approved', location: { $ne: '' } } },
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  // Experience distribution
  const experienceAgg = await Employee.aggregate([
    { $match: { status: 'approved' } },
    {
      $bucket: {
        groupBy: '$totalYearsOfExperience',
        boundaries: [0, 2, 5, 8, 12, 20],
        default: '20+',
        output: { count: { $sum: 1 } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totals: { total, approved, pending, rejected },
      topSkills: topSkillsAgg,
      locationDistribution: locationAgg,
      experienceDistribution: experienceAgg
    }
  });
});
