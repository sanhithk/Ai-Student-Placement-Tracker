const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, getCompanyMatchScore, generateCompanyRoadmap } = require('../controllers/companyController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getCompanies);
router.route('/:id').get(protect, getCompanyById);
router.route('/:id/match').get(protect, getCompanyMatchScore);
router.route('/:id/roadmap').post(protect, generateCompanyRoadmap);

module.exports = router;
