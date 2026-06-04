const express = require('express');
const router = express.Router();
const {
  generateNextQuestion,
  evaluateInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/next').post(protect, generateNextQuestion);
router.route('/evaluate').post(protect, evaluateInterview);

module.exports = router;
