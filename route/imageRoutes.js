const express = require('express');
const router = express.Router();

router.route('/story/generate').post(storyGenerate);


module.exports = router;
