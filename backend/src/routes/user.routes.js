const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { getProfile, followUser, updateMe } = require('../controllers/user.controller');

router.patch('/me', auth, updateMe);
router.get('/:id', getProfile);
router.post('/:id/follow', auth, followUser);

module.exports = router;