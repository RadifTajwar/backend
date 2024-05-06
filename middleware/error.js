const errorHandler = require('../utils/errorHandler'); // Import the custom error handler utility

// Error handling middleware
module.exports = (err, req, res, next) => {
    // Set default values for error status code and message
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error!';

    // Handle CastError (wrong MongoDB ID format)
    if (err.name === 'CastError') {
        const message = `Resource not Found. Invalid: ${err.path}`;
        err = new errorHandler(message, 404);
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered!`;
        err = new errorHandler(message, 400);
    }

    // Handle invalid JSON Web Token (JWT) error
    if (err.name === 'JsonWebTokenError') {
        const message = `JSON Web Token is Invalid, Try Again!`;
        err = new errorHandler(message, 400);
    }

    // Handle expired JSON Web Token (JWT) error
    if (err.name === 'TokenExpiredError') {
        const message = `JSON Web Token is Expired, Try Again!`;
        err = new errorHandler(message, 400);
    }

    // Respond with appropriate status code and error message
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
