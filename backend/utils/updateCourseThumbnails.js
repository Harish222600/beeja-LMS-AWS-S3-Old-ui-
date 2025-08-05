const mongoose = require('mongoose');
const Course = require('../models/course');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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

// Map of course names to new thumbnail URLs
const newThumbnailUrl = "https://blog.ipleaders.in/wp-content/uploads/2021/05/online-course-blog-header.jpg";

const updateThumbnails = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses`);

        for (const course of courses) {
            course.thumbnail = newThumbnailUrl;
            await course.save();
            console.log(`Updated thumbnail for course: ${course.courseName}`);
        }

        await mongoose.connection.close();
        console.log("Database connection closed. Thumbnails updated successfully.");
    } catch (error) {
        console.error("Error updating thumbnails:", error);
        process.exit(1);
    }
};

updateThumbnails();
