const mongoose = require('mongoose');
const Category = require('../models/category');

require('dotenv').config();

if (!process.env.MONGODB_URL) {
    console.error('Error: MONGODB_URL environment variable is required');
    process.exit(1);
}

// MongoDB URI validation and normalization
const validateMongoURI = (uri) => {
    if (!uri) {
        throw new Error('MONGODB_URL environment variable is required');
    }

    try {
        // Basic cleanup
        uri = uri.trim();

        // Check if it's Atlas or local MongoDB
        const isAtlas = uri.includes('mongodb+srv');
        const isLocal = uri.includes('mongodb://');

        if (!isAtlas && !isLocal) {
            throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
        }

        // Parse the URI to validate its structure
        const url = new URL(uri);
        
        // Ensure protocol is correct
        if (isAtlas && url.protocol !== 'mongodb+srv:') {
            url.protocol = 'mongodb+srv:';
        } else if (isLocal && url.protocol !== 'mongodb:') {
            url.protocol = 'mongodb:';
        }

        // Add database name if not present
        if (!url.pathname || url.pathname === '/') {
            url.pathname = '/lms';
        }

        // Return the normalized URI
        return url.toString();
    } catch (error) {
        if (error instanceof TypeError) {
            // URL parsing failed, try basic string manipulation
            let normalizedUri = uri;
            
            // Ensure proper protocol
            if (uri.includes('mongodb+srv')) {
                normalizedUri = normalizedUri.replace(/^mongodb\+srv:?\/?\/?\/?/, 'mongodb+srv://');
            } else {
                normalizedUri = normalizedUri.replace(/^mongodb:?\/?\/?\/?/, 'mongodb://');
            }
            
            // Add database name if missing
            if (!normalizedUri.includes('/lms')) {
                const queryIndex = normalizedUri.indexOf('?');
                if (queryIndex !== -1) {
                    normalizedUri = normalizedUri.slice(0, queryIndex) + '/lms' + normalizedUri.slice(queryIndex);
                } else {
                    normalizedUri += '/lms';
                }
            }
            
            return normalizedUri;
        }
        throw error;
    }
};

// MongoDB connection
const MONGO_URI = validateMongoURI(process.env.MONGODB_URL);

const categories = [
    {
        name: "Web Development",
        description: "Learn web development from scratch to advanced level"
    },
    {
        name: "Mobile Development",
        description: "Master mobile app development for iOS and Android"
    },
    {
        name: "Data Science",
        description: "Explore data science, machine learning, and AI"
    },
    {
        name: "Cloud Computing",
        description: "Learn cloud platforms like AWS, Azure, and GCP"
    }
];

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing categories
        await Category.deleteMany({});
        console.log("Cleared existing categories");

        // Insert new categories
        const createdCategories = await Category.insertMany(categories);
        console.log("Added categories:", createdCategories);

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");

    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

// Run the seed function
seedCategories();
