const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { listNotifications, markAllRead } = require('../controllers/notification.controller');

router.get('/', auth, listNotifications);
router.patch('/read', auth, markAllRead);

module.exports = router;
