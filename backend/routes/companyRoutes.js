const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, getCompanyMatchScore } = require('../controllers/companyController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getCompanies);
router.route('/:id').get(protect, getCompanyById);
router.route('/:id/match').get(protect, getCompanyMatchScore);

module.exports = router;
