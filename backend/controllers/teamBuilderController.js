const Employee = require('../models/Employee');
const { buildTeam } = require('../services/claudeService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.buildTeam = asyncHandler(async (req, res) => {
  const { requirement, availability, location } = req.body;

  if (!requirement || requirement.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Please provide a detailed team requirement (at least 10 characters)' });
  }

  const query = { status: 'approved', availability: { $ne: 'notice-period' } };
  if (availability?.length > 0) query.availability = { $in: availability };
  if (location?.trim()) query.location = new RegExp(location.trim(), 'i');

  const employees = await Employee.find(query)
    .select('name role location totalYearsOfExperience skills projects availability summary email phone linkedIn github portfolio avatar certifications previousCompanies')
    .lean();

  if (employees.length < 2) {
    return res.status(400).json({ success: false, message: 'Not enough approved employees to build a team' });
  }

  const teamComposition = await buildTeam(requirement, employees);

  // Enrich with full employee data
  const enrichedMembers = teamComposition.members.map(member => {
    const employee = employees.find(e => e._id.toString() === member.id);
    return {
      ...member,
      employeeData: employee ? {
        ...employee,
        topSkills: employee.skills.filter(s => !s.isInferred).slice(0, 5).map(s => s.name),
      } : null
    };
  }).filter(m => m.employeeData !== null);

  res.status(200).json({
    success: true,
    data: {
      ...teamComposition,
      members: enrichedMembers
    }
  });
});
