const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database using the provided URI.
 *
 * @param {Object} data - Additional data or configuration for connecting to the database.
 * @returns {Promise<void>} - A promise that resolves when the database connection is established.
 */
const connectDatabase = async (data) => {
    try {
        // Connect to the MongoDB database using the provided URI and options.
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Log a message indicating that the database connection was successful.
        console.log(`MongoDB Connected!`);
    } catch (error) {
        // Handle any errors that occur during the database connection process.
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
};

module.exports = connectDatabase;