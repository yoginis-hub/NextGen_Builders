const express = require('express');
const router = express.Router();
const {
  getAllEmployees, getEmployee, getMyProfile,
  updateEmployee, deleteEmployee, getStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('hr'), getStats);
router.get('/me', getMyProfile);
router.get('/', getAllEmployees);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', authorize('hr'), deleteEmployee);

module.exports = router;
