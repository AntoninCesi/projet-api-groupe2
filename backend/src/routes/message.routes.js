const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requiredFields = require('../middlewares/requiredFields.middleware');
const { listConversations, getConversation, sendMessage } = require('../controllers/message.controller');

router.get('/', auth, listConversations);
router.post('/', auth, requiredFields(['receiverId', 'content']), sendMessage);
router.get('/:userId', auth, getConversation);

module.exports = router;
