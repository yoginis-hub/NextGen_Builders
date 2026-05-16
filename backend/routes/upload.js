const express = require('express');
const router = express.Router();
const { uploadResume, getUploadStatus } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/resume', upload.single('resume'), uploadResume);
router.get('/status', getUploadStatus);

module.exports = router;
