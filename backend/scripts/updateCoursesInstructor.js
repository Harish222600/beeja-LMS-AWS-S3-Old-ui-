const mongoose = require('mongoose');
const Course = require('../models/course');
const User = require('../models/user');

require('dotenv').config();

if (!process.env.MONGODB_URL) {
    console.error('Error: MONGODB_URL environment variable is required');
    process.exit(1);
}

async function updateCoursesInstructor() {
  try {
    const MONGO_URI = process.env.MONGODB_URL;
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const instructor = await User.findOne({ accountType: 'Instructor' }).lean();
    if (!instructor) {
      console.error('No instructor found');
      process.exit(1);
    }

    const result = await Course.updateMany(
      { instructor: null },
      { $set: { instructor: instructor._id } }
    );

    console.log(`Updated ${result.modifiedCount} courses with null instructor to instructor ID: ${instructor._id}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating courses:', error);
    process.exit(1);
  }
}

updateCoursesInstructor();
