const express = require('express');
const router = express.Router();
const requiredFields = require('../middlewares/requiredFields.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { register, login, me } = require('../controllers/auth.controller');

router.post('/register', requiredFields(['email', 'password', 'username']), register);
router.post('/login', requiredFields(['email', 'password']), login);
router.get('/me', authMiddleware, me);

module.exports = router;