const express = require('express');
const router = express.Router();
const { buildTeam } = require('../controllers/teamBuilderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('hr'));
router.post('/build', buildTeam);

module.exports = router;
