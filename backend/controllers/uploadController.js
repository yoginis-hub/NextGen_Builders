const fs = require('fs');
const pdfParse = require('pdf-parse');
const Employee = require('../models/Employee');
const Review = require('../models/Review');
const { extractSkillsFromResume } = require('../services/claudeService');
const { inferSkills } = require('../services/skillInference');
const { asyncHandler } = require('../middleware/errorHandler');

exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
  }

  const filePath = req.file.path;
  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please ensure the PDF contains readable text.' });
    }

    // Extract structured data using Claude
    const extractedData = await extractSkillsFromResume(resumeText);

    // Infer additional skills
    const inferredSkills = inferSkills(extractedData.skills || []);
    const allSkills = [...(extractedData.skills || []), ...inferredSkills];

    // Find or create employee profile
    let employee = await Employee.findOne({ userId: req.user.id });

    if (!employee) {
      employee = new Employee({ userId: req.user.id, email: req.user.email });
    }

    // Store original data for review
    const originalData = { ...employee.toObject() };

    // Update employee with extracted data
    Object.assign(employee, {
      name: extractedData.name || employee.name || req.user.name,
      role: extractedData.role || employee.role,
      location: extractedData.location || employee.location,
      phone: extractedData.phone || employee.phone,
      summary: extractedData.summary || employee.summary,
      totalYearsOfExperience: extractedData.totalYearsOfExperience || employee.totalYearsOfExperience,
      skills: allSkills,
      projects: extractedData.projects || employee.projects,
      certifications: extractedData.certifications || employee.certifications,
      previousCompanies: extractedData.previousCompanies || employee.previousCompanies,
      education: extractedData.education || employee.education,
      resumeUrl: fileUrl,
      resumeText: resumeText,
      status: 'pending'
    });

    await employee.save();

    // Create review entry
    await Review.create({
      employeeId: employee._id,
      status: 'pending',
      originalData,
      modifiedData: employee.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      data: {
        employee,
        extractedSkillsCount: (extractedData.skills || []).length,
        inferredSkillsCount: inferredSkills.length,
        totalSkillsCount: allSkills.length
      }
    });

  } catch (error) {
    // Cleanup file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
});

exports.getUploadStatus = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: 'No profile found' });
  }
  res.status(200).json({ success: true, data: employee });
});
