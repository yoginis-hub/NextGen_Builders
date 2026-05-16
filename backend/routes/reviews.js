const express = require('express');
const router = express.Router();
const { getPendingReviews, approveEmployee, rejectEmployee, getReviewHistory } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('hr'));

router.get('/pending', getPendingReviews);
router.get('/history', getReviewHistory);
router.put('/:id/approve', approveEmployee);
router.put('/:id/reject', rejectEmployee);

module.exports = router;
