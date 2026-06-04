const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/authController.js');
const { updateUserProfile, getCodingStats } = require('../controllers/userController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/coding-stats', protect, getCodingStats);

module.exports = router;
