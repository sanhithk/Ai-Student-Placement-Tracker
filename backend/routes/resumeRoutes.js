const express = require('express');
const router = express.Router();
const {
  analyzeResume,
  getResumes,
} = require('../controllers/resumeController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const upload = require('../middlewares/uploadMiddleware.js');

router.route('/').get(protect, getResumes);
router.route('/analyze').post(protect, upload.single('resume'), analyzeResume);

module.exports = router;
