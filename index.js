// Import necessary modules and files
const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./database')
const cloudinary = require('cloudinary')
// Handle uncaught exceptions (e.g., programming errors) to prevent crashing
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Uncaught Exception')
    process.exit(1)
})

// Load environment variables from config file
dotenv.config({path: '.env'})

// Connect to the database
connectDatabase()



// Start the server and listen on the specified port
const server = app.listen(process.env.PORT, () => {
    console.log(`Server Working on http://localhost:${process.env.PORT}!`);
})


// Handle unhandled promise rejections (e.g., database connection errors)
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection');
    // Close the server gracefully before exiting the process
    server.close(() => {
        process.exit(1);
    })
})
