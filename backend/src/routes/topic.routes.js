const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { listTopics, getTopic, followTopic } = require('../controllers/topic.controller');

router.get('/', listTopics);
router.get('/:id', getTopic);
router.post('/:id/follow', auth, followTopic);

module.exports = router;
