const catchAsyncError = require('./catchAsyncError'); // Import the catchAsyncError middleware
const errorHandler = require("../utils/errorHandler"); // Import the custom error handler utility
const jwt = require('jsonwebtoken'); // Import the JSON Web Token library
const User = require('../models/userModel'); // Import the User model
const { next } = require("express"); // Import the 'next' function from the Express module

// Middleware to check if the user is authenticated
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const cookiesHeader = req.headers.cookie; // Get the 'Cookie' header from the request
    let token = null;

    if (cookiesHeader) {
        const cookies = cookiesHeader.split(';'); // Split the cookies into an array
        const tokenCookie = cookies.find(cookie => {
            const [key, value] = cookie.trim().split('='); // Split cookie into key and value
            return key === 'token'; // Check if the cookie key is 'token'
        });

        if (tokenCookie) {
            token = tokenCookie.split('=')[1]; // Extract the token value
        }
    }

    if (token === null) {
        return next(new errorHandler('Please Login to Access this Resource!', 401)); // Unauthorized access
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
    req.user = await User.findById(decodedData.id); // Get the user data from the decoded token
    console.log('User Authenticated!');
    next(); // Move to the next middleware
});

// Middleware to check if the user has authorized roles
exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { // Check if user's role is in the authorized roles list
            return next(new errorHandler(`Role: ${req.user.role} is not allowed to Request this Resource`, 403)); // Forbidden access
        }
        console.log('Admin Access Successful!');
        next(); // Move to the next middleware
    };
};
