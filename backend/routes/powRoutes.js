const express = require('express');
const router = express.Router();
const { generatePoWProject } = require('../controllers/powController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.route('/generate').post(protect, generatePoWProject);

module.exports = router;
