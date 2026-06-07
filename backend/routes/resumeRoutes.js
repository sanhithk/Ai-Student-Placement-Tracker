const express = require('express');
const router = express.Router();
const {
  analyzeResume,
  getResumes,
  generateShareLink,
  getPublicResume,
} = require('../controllers/resumeController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const upload = require('../middlewares/uploadMiddleware.js');

router.route('/').get(protect, getResumes);
router.route('/analyze').post(protect, upload.single('resume'), analyzeResume);
router.route('/:id/share').post(protect, generateShareLink);
router.route('/public/:shareId').get(getPublicResume);

module.exports = router;
