const mongoose = require('mongoose');
const Certificate = require('../models/certificate');
const Course = require('../models/course');
const Category = require('../models/category');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateCertificatesWithCategory() {
  try {
    console.log('Starting certificate category update...');
    
    // Get all certificates
    const certificates = await Certificate.find({});
    console.log(`Found ${certificates.length} certificates to update`);
    
    for (const certificate of certificates) {
      // Get the course with category populated
      const course = await Course.findById(certificate.courseId).populate('category', 'name');
      
      if (course && course.category) {
        certificate.categoryName = course.category.name;
        await certificate.save();
        console.log(`Updated certificate ${certificate.certificateId} with category: ${course.category.name}`);
      } else {
        certificate.categoryName = 'General';
        await certificate.save();
        console.log(`Updated certificate ${certificate.certificateId} with default category: General`);
      }
    }
    
    console.log('Certificate category update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating certificates:', error);
    process.exit(1);
  }
}

updateCertificatesWithCategory();
