const express = require('express');
const router = express.Router();
const { semanticSearch, getSearchHistory, filterEmployees } = require('../controllers/searchController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/semantic', authorize('hr'), semanticSearch);
router.get('/history', authorize('hr'), getSearchHistory);
router.get('/filter', filterEmployees);

module.exports = router;
