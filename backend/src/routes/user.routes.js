const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { getProfile, followUser, updateMe, setUserStatus } = require('../controllers/user.controller');

router.patch('/me', auth, updateMe);
router.get('/:id', getProfile);
router.post('/:id/follow', auth, followUser);
router.patch('/:id/status', auth, setUserStatus);

module.exports = router;