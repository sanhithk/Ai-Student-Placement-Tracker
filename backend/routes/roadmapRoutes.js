const express = require('express');
const router = express.Router();
const {
  generateRoadmap,
  getRoadmap,
  updateStepStatus,
} = require('../controllers/roadmapController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/generate').post(protect, generateRoadmap);
router.route('/').get(protect, getRoadmap);
router.route('/:id/step/:stepId').put(protect, updateStepStatus);

module.exports = router;
