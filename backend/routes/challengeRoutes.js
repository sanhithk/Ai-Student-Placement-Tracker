const express = require('express');
const router = express.Router();
const { getDailyChallenge, completeChallenge, getLeaderboard } = require('../controllers/challengeController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/daily', protect, getDailyChallenge);
router.post('/:id/complete', protect, completeChallenge);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
