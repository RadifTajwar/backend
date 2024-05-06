// Export a higher-order function that wraps an asynchronous function
module.exports = theFunc => (req, res, next) => {
    // Call the asynchronous function and resolve the returned promise
    // If the promise resolves successfully, move to the next middleware
    // If the promise rejects, the error will be caught and passed to the next middleware for error handling
    Promise.resolve(theFunc(req, res, next)).catch(next);
};
