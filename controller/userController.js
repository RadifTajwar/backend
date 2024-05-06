const express = require('express');
const router = express.Router();
const errorHandler = require("../utils/errorHandler");
const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const { next } = require("express");
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require("crypto");
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/multer');
const axios =require('axios');
// Register a new user
exports.formInput = catchAsyncError(async (req, res, next) => {
        console.log('hello');
        res.status(200).json({ success: 'registration successful' });

});


