const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireFields = require('../middlewares/requiredFields.middleware');
const { sendMessage, getConversation, listConversations } = require('../controllers/message.controller');

router.get('/', auth, listConversations);
router.post('/', auth, requireFields(['receiverId', 'content']), sendMessage);
router.get('/:userId', auth, getConversation);

module.exports = router;