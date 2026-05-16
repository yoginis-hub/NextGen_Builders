const fs = require('fs')
const pdfParse = require('pdf-parse')

// pdf-parse has a known initialization bug where the very first call always
// fails with "bad XRef entry". Warm it up once at module load to avoid this.
;(async () => {
  try {
    const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 1 1]>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF', 'latin1')
    await pdfParse(minimalPdf)
  } catch (_) { /* expected to fail — this just warms up the parser */ }
})()
const User = require('../models/User')
const Employee = require('../models/Employee')
const { extractSkillsFromResume } = require('../services/claudeService')
const { inferSkills } = require('../services/skillInference')
const { asyncHandler } = require('../middleware/errorHandler')
const { sendWelcomeEmail } = require('../services/emailService')

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = 'Skill@'
  for (let i = 0; i < 6; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

// Process a single PDF file and extract data via Claude
const processPDF = async (filePath, originalName) => {
  const buffer = fs.readFileSync(filePath)
  const pdfData = await pdfParse(buffer)
  const text = pdfData.text?.trim()

  if (!text || text.length < 50) {
    throw new Error(`Could not extract readable text from "${originalName}". Make sure it's not a scanned image.`)
  }

  const extracted = await extractSkillsFromResume(text)
  const inferredSkills = inferSkills(extracted.skills || [])

  return {
    ...extracted,
    skills: [...(extracted.skills || []), ...inferredSkills],
    extractedSkillsCount: (extracted.skills || []).length,
    inferredSkillsCount: inferredSkills.length,
    fileName: originalName,
    filePath
  }
}

// Preview: process all uploaded PDFs and return extracted data (no DB writes)
exports.previewPDFImport = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload at least one PDF file' })
  }

  const results = []

  for (const file of req.files) {
    try {
      const data = await processPDF(file.path, file.originalname)
      const warnings = []
      if (!data.name?.trim()) warnings.push('Name could not be extracted')
      if (!data.email?.trim()) warnings.push('Email could not be extracted')

      results.push({
        fileName: file.originalname,
        fileSize: file.size,
        filePath: file.path,
        isValid: warnings.length === 0,
        warnings,
        ...data
      })
    } catch (err) {
      results.push({
        fileName: file.originalname,
        fileSize: file.size,
        filePath: file.path,
        isValid: false,
        warnings: [err.message],
        name: '', email: '', role: '', skills: []
      })
    }
  }

  res.status(200).json({
    success: true,
    data: {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      rows: results
    }
  })
})

// Confirm: create employee accounts from already-extracted data
exports.confirmPDFImport = asyncHandler(async (req, res) => {
  const { employees } = req.body   // array of extracted employee objects

  if (!employees || employees.length === 0) {
    return res.status(400).json({ success: false, message: 'No employee data provided' })
  }

  const defaultPassword = 'SkillSync@123'
  const results = { created: 0, skipped: 0, errors: [], credentials: [] }

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    try {
      if (!emp.name?.trim() || !emp.email?.trim()) {
        results.skipped++
        results.errors.push({ index: i + 1, fileName: emp.fileName, error: 'Missing name or email' })
        continue
      }

      const existing = await User.findOne({ email: emp.email.toLowerCase().trim() })
      if (existing) {
        results.skipped++
        results.errors.push({ index: i + 1, fileName: emp.fileName, error: `Email "${emp.email}" already exists` })
        continue
      }

      const user = await User.create({
        name: emp.name.trim(),
        email: emp.email.toLowerCase().trim(),
        password: defaultPassword,
        role: 'employee'
      })

      await Employee.create({
        userId: user._id,
        name: emp.name.trim(),
        email: emp.email.toLowerCase().trim(),
        role: emp.role?.trim() || '',
        location: emp.location?.trim() || '',
        phone: emp.phone?.trim() || '',
        summary: emp.summary?.trim() || '',
        totalYearsOfExperience: emp.totalYearsOfExperience || 0,
        skills: emp.skills || [],
        projects: emp.projects || [],
        certifications: emp.certifications || [],
        previousCompanies: emp.previousCompanies || [],
        education: emp.education || [],
        availability: 'available',
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: `Imported via bulk PDF upload by HR`
      })

      results.created++
      results.credentials.push({
        name: emp.name.trim(),
        email: emp.email.toLowerCase().trim(),
        password: defaultPassword
      })

      console.log(`[PDF Import] Created: ${emp.name.trim()} | Email: ${emp.email.toLowerCase().trim()} | Password: ${defaultPassword}`)

      // Clean up uploaded file
      if (emp.filePath && fs.existsSync(emp.filePath)) {
        fs.unlinkSync(emp.filePath)
      }
    } catch (err) {
      results.skipped++
      results.errors.push({ index: i + 1, fileName: emp.fileName, error: err.message })
    }
  }

  res.status(200).json({
    success: true,
    message: `Import complete. ${results.created} employees created, ${results.skipped} skipped.`,
    data: results
  })
})

// Direct import: HR fills in employee details manually, system creates accounts and emails credentials
exports.directImport = asyncHandler(async (req, res) => {
  const { employees } = req.body

  if (!employees || employees.length === 0) {
    return res.status(400).json({ success: false, message: 'No employee data provided' })
  }

  const results = { created: 0, skipped: 0, errors: [], credentials: [] }

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    try {
      const name = emp.name?.trim()
      const email = emp.email?.toLowerCase().trim()

      if (!name || !email) {
        results.skipped++
        results.errors.push({ index: i + 1, name: name || 'Unknown', error: 'Name and email are required' })
        continue
      }

      const existing = await User.findOne({ email })
      if (existing) {
        results.skipped++
        results.errors.push({ index: i + 1, name, error: `Email "${email}" already registered` })
        continue
      }

      const password = generatePassword()

      const user = await User.create({ name, email, password, role: 'employee' })

      await Employee.create({
        userId: user._id,
        name,
        email,
        role: emp.role?.trim() || '',
        location: emp.location?.trim() || '',
        phone: emp.phone?.trim() || '',
        totalYearsOfExperience: parseInt(emp.totalYearsOfExperience) || 0,
        availability: emp.availability || 'available',
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: 'Directly added by HR'
      })

      // Send welcome email with credentials
      const emailResult = await sendWelcomeEmail({ name, email, password })

      console.log(`[Direct Import] Created: ${name} | Email: ${email} | Password: ${password}`)

      results.created++
      results.credentials.push({
        name,
        email,
        password,
        emailSent: emailResult.sent
      })
    } catch (err) {
      results.skipped++
      results.errors.push({ index: i + 1, name: emp.name || 'Unknown', error: err.message })
    }
  }

  res.status(200).json({
    success: true,
    message: `${results.created} employee(s) created. Credentials emailed where configured.`,
    data: results
  })
})
