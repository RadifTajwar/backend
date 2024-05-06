const express = require('express');
const router = express.Router();

// Import your user model

const {promptGenerate, sotryBeginingFromUser,storyLines} = require('../controller/promptController')

// Define routes

router.route('/story/promptGenerate').post(promptGenerate);
router.route('/story/generate').get(sotryBeginingFromUser);
router.route('/story/lines').post(storyLines)
module.exports = router;
