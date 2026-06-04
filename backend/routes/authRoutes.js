const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  googleAuth,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController.js');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
