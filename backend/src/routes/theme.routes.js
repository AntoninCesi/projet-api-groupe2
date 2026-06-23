const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { listThemes, getTheme, followTheme } = require('../controllers/theme.controller');

router.get('/', listThemes);
router.get('/:name', getTheme);
router.post('/:name/follow', auth, followTheme);

module.exports = router;
