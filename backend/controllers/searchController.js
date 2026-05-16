const Employee = require('../models/Employee');
const SearchHistory = require('../models/SearchHistory');
const { semanticSearch } = require('../services/claudeService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.semanticSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Search query must be at least 3 characters' });
  }

  const startTime = Date.now();

  // Get all approved employees for semantic search
  const employees = await Employee.find({ status: 'approved' })
    .select('name role location totalYearsOfExperience skills projects previousCompanies availability summary')
    .lean();

  if (employees.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      message: 'No approved employees found',
      query,
      totalCandidates: 0
    });
  }

  // Perform semantic search via Claude
  const rankedResults = await semanticSearch(query, employees);

  // Map results back to full employee data
  const enrichedResults = rankedResults.map(result => {
    const employee = employees.find(e => e._id.toString() === result.id);
    return {
      ...result,
      employee: employee ? {
        _id: employee._id,
        name: employee.name,
        role: employee.role,
        location: employee.location,
        totalYearsOfExperience: employee.totalYearsOfExperience,
        skills: employee.skills.filter(s => !s.isInferred).slice(0, 8),
        availability: employee.availability,
        summary: employee.summary
      } : null
    };
  }).filter(r => r.employee !== null);

  const responseTime = Date.now() - startTime;

  // Save search history
  try {
    await SearchHistory.create({
      searchedBy: req.user.id,
      query,
      resultsCount: enrichedResults.length,
      topResultIds: enrichedResults.slice(0, 3).map(r => r.id),
      searchType: 'semantic',
      responseTime
    });
  } catch (err) {
    // Non-critical, don't fail the request
    console.error('Failed to save search history:', err.message);
  }

  res.status(200).json({
    success: true,
    data: enrichedResults,
    query,
    totalCandidates: employees.length,
    resultsFound: enrichedResults.length,
    responseTime
  });
});

exports.getSearchHistory = asyncHandler(async (req, res) => {
  const history = await SearchHistory.find({ searchedBy: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({ success: true, data: history });
});

exports.filterEmployees = asyncHandler(async (req, res) => {
  const { skills, location, minExperience, maxExperience, availability, role } = req.query;

  let query = { status: 'approved' };

  if (skills) {
    const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
    query['skills.name'] = { $in: skillList.map(s => new RegExp(`^${s}$`, 'i')) };
  }
  if (location) query.location = new RegExp(location, 'i');
  if (availability) query.availability = availability;
  if (role) query.role = new RegExp(role, 'i');
  if (minExperience || maxExperience) {
    query.totalYearsOfExperience = {};
    if (minExperience) query.totalYearsOfExperience.$gte = parseInt(minExperience);
    if (maxExperience) query.totalYearsOfExperience.$lte = parseInt(maxExperience);
  }

  const employees = await Employee.find(query)
    .sort({ totalYearsOfExperience: -1 })
    .select('-resumeText')
    .limit(50);

  res.status(200).json({ success: true, data: employees, total: employees.length });
});
