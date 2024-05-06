// Function to create a token and save it in a cookie
const sendToken = (user, statusCode, res,userType) => {
    // Generate a JSON Web Token (JWT) using the user's data
    const token = user.getJWTToken();

    // Define options for the cookie, including expiration and HTTP-only setting
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    console.log("options expires in " +options.expires);

    // Set the token as a cookie in the response, along with the user data
    res.status(statusCode).cookie('token', token, options).json({
            success: true,
            user,
            token,
            userType:userType
        });
};

// Export the sendToken function to be used in other parts of the code
module.exports = sendToken;
