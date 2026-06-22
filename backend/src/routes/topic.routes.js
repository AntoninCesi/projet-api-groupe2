const express = require('express');
const router = express.Router();
const { listTopics, getTopic } = require('../controllers/topic.controller');

router.get('/', listTopics);
router.get('/:id', getTopic);

module.exports = router;