const express = require('express');
const router = express.Router();
const { getReadinessScore, getAIRecommendations, updateAptitudeScore } = require('../controllers/readinessController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getReadinessScore);
router.route('/ai-recommendations').post(protect, getAIRecommendations);
router.route('/aptitude').put(protect, updateAptitudeScore);

module.exports = router;
