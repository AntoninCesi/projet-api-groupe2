const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { getProfile, followUser } = require('../controllers/user.controller');

router.get('/:id', getProfile);
router.post('/:id/follow', auth, followUser);

module.exports = router;