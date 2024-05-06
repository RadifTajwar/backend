const { json } = require("express");

// Class to handle API features like searching, filtering, and pagination
class apiFeatures {
    constructor(query, queryStr) {
        this.query = query;       // Mongoose query object
        this.queryStr = queryStr; // Query string parameters
    }

    // Method to apply search keyword filtering
    search() {
        const keyword = this.queryStr.keyword ? {
            drug_name: {
                $regex: this.queryStr.keyword, // Regular expression for case-insensitive search
                $options: "i" // Case insensitive
            }
        } : {};
        this.query = this.query.find({ ...keyword }); // Apply the search filter to the query
        return this;
    }

    // Method to apply generic filtering based on query parameters
    filter() {
        const queryCopy = { ...this.queryStr }; // Create a copy of the query parameters

        // Remove specific fields from the query parameters
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach(key => delete queryCopy[key]);

        // Transform filter criteria for price and rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gte|lt|gt|lte)\b/g, key => `$${key}`);
        this.query = this.query.find(JSON.parse(queryStr)); // Apply the filter to the query
        return this;
    }

    // Method to apply pagination to the query
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip); // Apply pagination to the query
        return this;
    }
}

module.exports = apiFeatures;
