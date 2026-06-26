const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken } = require('../../controllers/authController');
const { registerValidation, loginValidation } = require('../../validators/validationRules');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/refresh', refreshToken);

module.exports = router;
