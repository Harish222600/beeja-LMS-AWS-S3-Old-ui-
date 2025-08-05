const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');

require('dotenv').config();
const MONGO_URI = process.env.MONGODB_URL;

const updateAdminPassword = async () => {
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the user's password
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword,
      accountType: 'Admin',
      active: true,
      approved: true 
    });

    console.log('Admin password updated successfully');

    // Verify the password
    const updatedUser = await User.findById(user._id);
    const isPasswordCorrect = await bcrypt.compare('admin123', updatedUser.password);
    console.log('Password verification:', isPasswordCorrect);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateAdminPassword();
