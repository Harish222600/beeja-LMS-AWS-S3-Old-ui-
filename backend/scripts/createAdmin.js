const mongoose = require('mongoose');
const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URL) {
    console.error('Error: MONGODB_URL environment variable is required');
    process.exit(1);
}

// MongoDB URI validation and normalization (same as database.js)
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

// Validate and normalize the MongoDB URI
const MONGO_URI = validateMongoURI(process.env.MONGODB_URL);

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'hariharish2604@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update to admin if not already
      if (existingAdmin.accountType !== 'Admin') {
        await User.findByIdAndUpdate(existingAdmin._id, { 
          accountType: 'Admin',
          active: true,
          approved: true 
        });
        console.log('Updated existing user to Admin');
      }
      process.exit(0);
    }

    // Create admin profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: "System Administrator",
      contactNumber: null
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      firstName: 'Harish',
      lastName: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      accountType: 'Admin',
      additionalDetails: profileDetails._id,
      approved: true,
      active: true,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=Harish Admin`
    });

    console.log('Admin user created successfully:', {
      email: adminUser.email,
      accountType: adminUser.accountType
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
