const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/multer');
// Import your user model

const {voiceGenerate,imageGenerate} = require('../controller/speechImageGenerationController')

// Define routes

router.route('/generate/speech').post(voiceGenerate);
router.route('/generate/images').post(imageGenerate)

module.exports = router;
