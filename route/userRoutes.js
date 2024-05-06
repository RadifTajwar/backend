const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/multer');
// Import your user model

const {formInput} = require('../controller/userController')

// Define routes

router.route('/user/formInput').post(formInput);


module.exports = router;
