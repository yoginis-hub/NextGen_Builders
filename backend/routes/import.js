const express = require('express')
const router = express.Router()
const { previewPDFImport, confirmPDFImport, directImport } = require('../controllers/importController')
const { protect, authorize } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Separate multer config for bulk imports (up to 20 files)
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `import-${unique}.pdf`)
  }
})

const bulkUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'))
  },
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.use(protect, authorize('hr'))

router.post('/preview', bulkUpload.array('resumes', 20), previewPDFImport)
router.post('/confirm', confirmPDFImport)
router.post('/direct', directImport)

module.exports = router
