const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireFields = require('../middlewares/requiredFields.middleware');
const { createPost, getPost } = require('../controllers/post.controller');

router.post('/', auth, requireFields(['content']), createPost);
router.get('/:id', getPost);

module.exports = router;