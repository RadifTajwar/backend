// Custom error handler class that extends the built-in Error class
class errorHandler extends Error {
    constructor(message, statusCode) {
        // Call the parent class constructor (Error) with the provided message
        super(message);

        // Set the custom properties for the error
        this.statusCode = statusCode;

        // Capture the stack trace to help identify the source of the error
        Error.captureStackTrace(this, this.constructor);
    }
}

// Export the errorHandler class to be used in other parts of the code
module.exports = errorHandler;
