const express = require('express');
const router = express.Router();
const {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getMatchedJobs,
} = require('../controllers/jobController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.route('/match').get(protect, getMatchedJobs);
router.route('/').get(protect, getJobs).post(protect, createJob);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
