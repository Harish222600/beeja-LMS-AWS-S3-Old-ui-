const mongoose = require('mongoose');
const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');

require('dotenv').config();
const MONGO_URI = process.env.MONGODB_URL;

const checkUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    // Find the user
    const user = await User.findOne({ email: 'hariharish2604@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('User found:', {
      email: user.email,
      accountType: user.accountType,
      active: user.active,
      approved: user.approved,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Test password
    const isPasswordCorrect = await bcrypt.compare('admin123', user.password);
    console.log('Password correct:', isPasswordCorrect);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();
