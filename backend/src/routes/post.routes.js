const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireFields = require('../middlewares/requiredFields.middleware');
const { createPost, getPost, likePost, addComment, addReply, likeComment, likeReply, listPosts, getFeed, reportPost } = require('../controllers/post.controller');

router.get('/', listPosts);
router.get('/feed', auth, getFeed);
router.get('/:id', getPost);
router.post('/', auth, requireFields(['content']), createPost);
router.post('/:id/like', auth, likePost);
router.post('/:id/comments', auth, requireFields(['content']), addComment);
router.post('/:id/comments/:commentId/replies', auth, requireFields(['content']), addReply);
router.post('/:id/comments/:commentId/like', auth, likeComment);
router.post('/:id/comments/:commentId/replies/:replyId/like', auth, likeReply);
router.post('/:id/report', auth, reportPost);

module.exports = router;