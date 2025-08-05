const mongoose = require('mongoose');
const Category = require('../models/category');
const Course = require('../models/course');
const User = require('../models/user');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Sample course data generator
const generateSampleCourses = (categoryId, instructorId) => {
    const courses = [
        {
            courseName: "Introduction to the Basics",
            courseType: "Paid",
            originalPrice: 1999,
            price: 999,
            courseDescription: "A comprehensive introduction to the fundamental concepts.",
            whatYouWillLearn: "Master the basic principles and core fundamentals",
            instructor: instructorId,
            thumbnail: "https://res.cloudinary.com/demo-asset/image/upload/v1/course-thumbnails/intro",
            tag: ["Beginner", "Fundamentals"],
            category: categoryId,
            status: "Published",
            instructions: ["Watch all lectures", "Complete assignments", "Take final test"],
        },
        {
            courseName: "Advanced Concepts",
            courseType: "Paid",
            originalPrice: 2999,
            price: 1499,
            courseDescription: "Deep dive into advanced topics and methodologies.",
            whatYouWillLearn: "Advanced techniques and professional practices",
            instructor: instructorId,
            thumbnail: "https://res.cloudinary.com/demo-asset/image/upload/v1/course-thumbnails/advanced",
            tag: ["Advanced", "Professional"],
            category: categoryId,
            status: "Published",
            instructions: ["Prior basic knowledge required", "Practice exercises", "Final project"],
        },
        {
            courseName: "Professional Masterclass",
            courseType: "Paid",
            originalPrice: 3999,
            price: 1999,
            courseDescription: "Expert-level training for professionals.",
            whatYouWillLearn: "Industry-standard practices and expert techniques",
            instructor: instructorId,
            thumbnail: "https://res.cloudinary.com/demo-asset/image/upload/v1/course-thumbnails/masterclass",
            tag: ["Expert", "Professional", "Masterclass"],
            category: categoryId,
            status: "Published",
            instructions: ["Complete prerequisites", "Follow course path", "Build portfolio"],
        },
        {
            courseName: "Quick Start Guide",
            courseType: "Free",
            originalPrice: 0,
            price: 0,
            courseDescription: "Quick introduction to get you started.",
            whatYouWillLearn: "Essential concepts and quick tips",
            instructor: instructorId,
            thumbnail: "https://res.cloudinary.com/demo-asset/image/upload/v1/course-thumbnails/quickstart",
            tag: ["Beginner", "Quick Start"],
            category: categoryId,
            status: "Published",
            instructions: ["Follow along", "Practice basics", "Complete quiz"],
        },
        {
            courseName: "Practical Workshop",
            courseType: "Paid",
            originalPrice: 2499,
            price: 1299,
            courseDescription: "Hands-on workshop with practical exercises.",
            whatYouWillLearn: "Real-world applications and practical skills",
            instructor: instructorId,
            thumbnail: "https://res.cloudinary.com/demo-asset/image/upload/v1/course-thumbnails/workshop",
            tag: ["Practical", "Workshop", "Hands-on"],
            category: categoryId,
            status: "Published",
            instructions: ["Complete exercises", "Build projects", "Submit work"],
        }
    ];

    return courses.map(course => ({
        ...course,
        createdAt: new Date(),
        updatedAt: new Date()
    }));
};

// Main function to add sample courses
const addSampleCourses = async () => {
    try {
        // Find instructor (assuming there's at least one instructor in the system)
        const instructor = await User.findOne({ accountType: 'Instructor' });
        if (!instructor) {
            console.error('No instructor found in the system');
            return;
        }

        // Get all categories
        const categories = await Category.find({});
        
        for (const category of categories) {
            console.log(`Adding courses to category: ${category.name}`);
            
            // Generate sample courses for this category
            const sampleCourses = generateSampleCourses(category._id, instructor._id);
            
            // Insert courses
            const insertedCourses = await Course.insertMany(sampleCourses);
            
            // Update category with new course IDs
            category.courses.push(...insertedCourses.map(course => course._id));
            await category.save();
            
            // Update instructor's courses
            instructor.courses.push(...insertedCourses.map(course => course._id));
            await instructor.save();
            
            console.log(`Added ${insertedCourses.length} courses to ${category.name}`);
        }

        console.log('Successfully added sample courses to all categories');
        process.exit(0);
    } catch (error) {
        console.error('Error adding sample courses:', error);
        process.exit(1);
    }
};

// Run the script
addSampleCourses();
