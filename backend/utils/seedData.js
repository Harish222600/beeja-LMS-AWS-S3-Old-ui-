const Category = require('../models/category');
const Course = require('../models/course');
const User = require('../models/user');
const Profile = require('../models/profile');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Sample Categories
const categories = [
    {
        name: "Web Development",
        description: "Master web development from front-end to back-end"
    },
    {
        name: "Mobile Development",
        description: "Learn to build mobile apps for iOS and Android"
    },
    {
        name: "Data Science",
        description: "Explore data analysis, machine learning, and AI"
    },
    {
        name: "Cloud Computing",
        description: "Master cloud platforms and DevOps practices"
    },
    {
        name: "Cybersecurity",
        description: "Learn to protect systems and networks from cyber threats"
    }
];

// Sample instructor profile data
const instructorProfileData = {
    gender: "Male",
    dateOfBirth: "1990-01-01",
    about: "Experienced web development instructor with 10+ years of industry experience",
    contactNumber: 1234567890
};

// Sample instructor data
const instructorData = {
    firstName: "Beeja",
    lastName: "innovation ventures",
    email: "beejainnovativeventures@gmail.com",
    password: "Admin123",
    accountType: "Admin",
    active: true,
    approved: true,
    image: "https://example.com/instructor-image.jpg", // placeholder image URL
    courses: []
};

// Sample courses data
const coursesData = [
    // Web Development courses
    {
        courseName: "Complete Web Development Bootcamp",
        courseDescription: "Learn full-stack web development from scratch",
        whatYouWillLearn: "HTML, CSS, JavaScript, React, Node.js, MongoDB",
        price: 499,
        tag: ["web development", "programming", "full-stack"],
        thumbnail: "https://example.com/web-dev-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic computer knowledge required",
            "No prior programming experience needed",
            "Laptop/Desktop with internet connection"
        ]
    },
    {
        courseName: "Advanced JavaScript Concepts",
        courseDescription: "Deep dive into JavaScript and ES6+ features",
        whatYouWillLearn: "Closures, Promises, Async/Await, Event Loop",
        price: 399,
        tag: ["web development", "javascript", "advanced"],
        thumbnail: "https://example.com/js-advanced-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic JavaScript knowledge required",
            "Familiarity with programming concepts"
        ]
    },
    {
        courseName: "React - The Complete Guide",
        courseDescription: "Learn React from basics to advanced topics",
        whatYouWillLearn: "React Hooks, Context API, Redux, Router",
        price: 599,
        tag: ["web development", "react", "frontend"],
        thumbnail: "https://example.com/react-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic JavaScript and HTML knowledge required",
            "Understanding of ES6+ features"
        ]
    },
    {
        courseName: "Node.js and Express.js Fundamentals",
        courseDescription: "Build backend applications with Node.js and Express",
        whatYouWillLearn: "REST APIs, Middleware, Authentication",
        price: 549,
        tag: ["web development", "node.js", "backend"],
        thumbnail: "https://example.com/node-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic JavaScript knowledge required",
            "Understanding of HTTP and REST"
        ]
    },

    // Mobile Development courses
    {
        courseName: "Mobile App Development with React Native",
        courseDescription: "Build cross-platform mobile apps",
        whatYouWillLearn: "React Native, JavaScript, Mobile Development Principles",
        price: 599,
        tag: ["mobile development", "react native", "javascript"],
        thumbnail: "https://example.com/mobile-dev-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic JavaScript knowledge required",
            "Understanding of React is helpful",
            "Mac/Windows computer required"
        ]
    },
    {
        courseName: "Android Development with Kotlin",
        courseDescription: "Learn native Android app development",
        whatYouWillLearn: "Kotlin, Android Studio, UI Design",
        price: 499,
        tag: ["mobile development", "android", "kotlin"],
        thumbnail: "https://example.com/android-kotlin-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic programming knowledge required",
            "Familiarity with Java is helpful"
        ]
    },
    {
        courseName: "iOS Development with Swift",
        courseDescription: "Build iOS apps using Swift and Xcode",
        whatYouWillLearn: "Swift, Xcode, UIKit, SwiftUI",
        price: 599,
        tag: ["mobile development", "ios", "swift"],
        thumbnail: "https://example.com/ios-swift-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Mac computer required",
            "Basic programming knowledge required"
        ]
    },
    {
        courseName: "Flutter Development for Beginners",
        courseDescription: "Create beautiful mobile apps with Flutter",
        whatYouWillLearn: "Dart, Flutter Widgets, State Management",
        price: 549,
        tag: ["mobile development", "flutter", "dart"],
        thumbnail: "https://example.com/flutter-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic programming knowledge required",
            "Familiarity with OOP concepts"
        ]
    },

    // Data Science courses
    {
        courseName: "Data Science Fundamentals",
        courseDescription: "Introduction to data science and analytics",
        whatYouWillLearn: "Python, Data Analysis, Machine Learning Basics",
        price: 699,
        tag: ["data science", "python", "machine learning"],
        thumbnail: "https://example.com/data-science-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Python knowledge helpful",
            "Understanding of mathematics",
            "Computer with minimum 8GB RAM"
        ]
    },
    {
        courseName: "Machine Learning A-Z",
        courseDescription: "Comprehensive machine learning course",
        whatYouWillLearn: "Supervised and Unsupervised Learning, Python",
        price: 799,
        tag: ["data science", "machine learning", "python"],
        thumbnail: "https://example.com/ml-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Python knowledge required",
            "Familiarity with statistics"
        ]
    },
    {
        courseName: "Deep Learning with TensorFlow",
        courseDescription: "Learn deep learning concepts and TensorFlow",
        whatYouWillLearn: "Neural Networks, CNNs, RNNs, TensorFlow",
        price: 899,
        tag: ["data science", "deep learning", "tensorflow"],
        thumbnail: "https://example.com/dl-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Python and ML knowledge required",
            "Understanding of calculus"
        ]
    },
    {
        courseName: "Data Visualization with Python",
        courseDescription: "Create stunning data visualizations",
        whatYouWillLearn: "Matplotlib, Seaborn, Plotly",
        price: 499,
        tag: ["data science", "data visualization", "python"],
        thumbnail: "https://example.com/dataviz-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Python knowledge required",
            "Familiarity with data analysis"
        ]
    },

    // Cloud Computing courses
    {
        courseName: "Cloud Computing Basics",
        courseDescription: "Introduction to cloud platforms and services",
        whatYouWillLearn: "AWS, Azure, Google Cloud",
        price: 599,
        tag: ["cloud computing", "aws", "azure"],
        thumbnail: "https://example.com/cloud-basics-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic IT knowledge required",
            "Understanding of networking"
        ]
    },
    {
        courseName: "AWS Certified Solutions Architect",
        courseDescription: "Prepare for AWS certification",
        whatYouWillLearn: "AWS services, architecture, best practices",
        price: 799,
        tag: ["cloud computing", "aws", "certification"],
        thumbnail: "https://example.com/aws-cert-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic cloud knowledge required",
            "Familiarity with AWS"
        ]
    },
    {
        courseName: "Azure Fundamentals",
        courseDescription: "Learn Microsoft Azure basics",
        whatYouWillLearn: "Azure services, portal, security",
        price: 699,
        tag: ["cloud computing", "azure", "microsoft"],
        thumbnail: "https://example.com/azure-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic IT knowledge required",
            "Understanding of cloud concepts"
        ]
    },
    {
        courseName: "DevOps with Kubernetes",
        courseDescription: "Learn DevOps practices with Kubernetes",
        whatYouWillLearn: "Kubernetes, Docker, CI/CD",
        price: 799,
        tag: ["cloud computing", "devops", "kubernetes"],
        thumbnail: "https://example.com/kubernetes-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Linux knowledge required",
            "Familiarity with containers"
        ]
    },

    // Cybersecurity courses
    {
        courseName: "Cybersecurity Fundamentals",
        courseDescription: "Learn the basics of cybersecurity",
        whatYouWillLearn: "Network Security, Threats, Defense",
        price: 599,
        tag: ["cybersecurity", "network security", "threats"],
        thumbnail: "https://example.com/cybersecurity-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic IT knowledge required",
            "Understanding of networks"
        ]
    },
    {
        courseName: "Ethical Hacking and Penetration Testing",
        courseDescription: "Learn ethical hacking techniques",
        whatYouWillLearn: "Penetration Testing, Tools, Techniques",
        price: 699,
        tag: ["cybersecurity", "ethical hacking", "penetration testing"],
        thumbnail: "https://example.com/ethical-hacking-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic networking knowledge required",
            "Familiarity with security concepts"
        ]
    },
    {
        courseName: "Security Operations and Incident Response",
        courseDescription: "Manage security operations centers",
        whatYouWillLearn: "Incident Response, Monitoring, SIEM",
        price: 649,
        tag: ["cybersecurity", "incident response", "security operations"],
        thumbnail: "https://example.com/security-ops-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic security knowledge required",
            "Understanding of IT operations"
        ]
    },
    {
        courseName: "Cryptography Basics",
        courseDescription: "Learn cryptography principles and applications",
        whatYouWillLearn: "Encryption, Decryption, Protocols",
        price: 549,
        tag: ["cybersecurity", "cryptography", "encryption"],
        thumbnail: "https://example.com/cryptography-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic math knowledge required",
            "Familiarity with security protocols"
        ]
    },

    // Additional courses added for more variety

    // Web Development additional courses
    {
        courseName: "Vue.js Essentials",
        courseDescription: "Learn the essentials of Vue.js framework",
        whatYouWillLearn: "Vue components, directives, Vue CLI",
        price: 450,
        tag: ["web development", "vue", "frontend"],
        thumbnail: "https://example.com/vue-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic JavaScript knowledge required",
            "Familiarity with HTML and CSS"
        ]
    },
    {
        courseName: "Full Stack MERN Development",
        courseDescription: "Master MERN stack development",
        whatYouWillLearn: "MongoDB, Express, React, Node.js",
        price: 650,
        tag: ["web development", "mern", "full-stack"],
        thumbnail: "https://example.com/mern-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic programming knowledge required",
            "Understanding of JavaScript and React"
        ]
    },

    // Mobile Development additional courses
    {
        courseName: "SwiftUI for iOS",
        courseDescription: "Build iOS apps with SwiftUI",
        whatYouWillLearn: "SwiftUI, Xcode, iOS app design",
        price: 620,
        tag: ["mobile development", "swiftui", "ios"],
        thumbnail: "https://example.com/swiftui-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Mac computer required",
            "Basic Swift knowledge helpful"
        ]
    },
    {
        courseName: "Kotlin Coroutines",
        courseDescription: "Learn asynchronous programming with Kotlin Coroutines",
        whatYouWillLearn: "Coroutines, Flow, concurrency",
        price: 480,
        tag: ["mobile development", "kotlin", "coroutines"],
        thumbnail: "https://example.com/kotlin-coroutines-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Kotlin knowledge required",
            "Understanding of Android development"
        ]
    },

    // Data Science additional courses
    {
        courseName: "Python for Data Analysis",
        courseDescription: "Learn Python libraries for data analysis",
        whatYouWillLearn: "Pandas, NumPy, Data Cleaning",
        price: 550,
        tag: ["data science", "python", "data analysis"],
        thumbnail: "https://example.com/python-data-analysis-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Python knowledge required",
            "Familiarity with data concepts"
        ]
    },
    {
        courseName: "Natural Language Processing",
        courseDescription: "Introduction to NLP techniques",
        whatYouWillLearn: "Text processing, sentiment analysis, NLTK",
        price: 700,
        tag: ["data science", "nlp", "machine learning"],
        thumbnail: "https://example.com/nlp-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic Python and ML knowledge required",
            "Understanding of linguistics helpful"
        ]
    },

    // Cloud Computing additional courses
    {
        courseName: "Google Cloud Platform Fundamentals",
        courseDescription: "Learn basics of GCP services",
        whatYouWillLearn: "Compute Engine, Cloud Storage, BigQuery",
        price: 620,
        tag: ["cloud computing", "gcp", "google cloud"],
        thumbnail: "https://example.com/gcp-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic cloud knowledge required",
            "Understanding of networking"
        ]
    },
    {
        courseName: "Terraform for Infrastructure as Code",
        courseDescription: "Manage infrastructure with Terraform",
        whatYouWillLearn: "Terraform basics, modules, state management",
        price: 680,
        tag: ["cloud computing", "terraform", "devops"],
        thumbnail: "https://example.com/terraform-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic DevOps knowledge required",
            "Familiarity with cloud platforms"
        ]
    },

    // Cybersecurity additional courses
    {
        courseName: "Network Security Essentials",
        courseDescription: "Learn fundamentals of network security",
        whatYouWillLearn: "Firewalls, VPNs, IDS/IPS",
        price: 580,
        tag: ["cybersecurity", "network security", "firewalls"],
        thumbnail: "https://example.com/network-security-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic IT knowledge required",
            "Understanding of networking concepts"
        ]
    },
    {
        courseName: "Malware Analysis Basics",
        courseDescription: "Introduction to malware analysis techniques",
        whatYouWillLearn: "Static and dynamic analysis, tools",
        price: 620,
        tag: ["cybersecurity", "malware", "analysis"],
        thumbnail: "https://example.com/malware-analysis-thumbnail.jpg",
        status: "Published",
        instructions: [
            "Basic security knowledge required",
            "Familiarity with operating systems"
        ]
    }
];

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seeding...");
        
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB for seeding");

        // Check if data already exists
        const existingCategories = await Category.countDocuments();
        const existingCourses = await Course.countDocuments();
        const existingUsers = await User.countDocuments();

        if (existingCategories > 0 || existingCourses > 0 || existingUsers > 0) {
            console.log("📊 Existing data found:");
            console.log(`   - Categories: ${existingCategories}`);
            console.log(`   - Courses: ${existingCourses}`);
            console.log(`   - Users: ${existingUsers}`);
            console.log("⚠️  Skipping seeding to preserve existing data");
            await mongoose.connection.close();
            return { success: true, message: "Seeding skipped - data already exists" };
        }

        console.log("🗑️  Clearing existing data...");
        await Category.deleteMany({});
        await Course.deleteMany({});
        await User.deleteMany({});
        await Profile.deleteMany({});
        console.log("✅ Cleared existing data");

        // Create instructor profile
        console.log("👤 Creating instructor profile...");
        const instructorProfile = await Profile.create(instructorProfileData);
        console.log("✅ Created instructor profile");

        // Hash the password before creating the instructor
        console.log("🔐 Hashing instructor password...");
        const hashedPassword = await bcrypt.hash(instructorData.password, 10);
        console.log("✅ Password hashed successfully");

        // Create instructor with profile reference and hashed password
        console.log("👨‍🏫 Creating instructor user...");
        const instructor = await User.create({
            ...instructorData,
            password: hashedPassword,
            additionalDetails: instructorProfile._id
        });
        console.log("✅ Created instructor user");

        // Insert categories
        console.log("📚 Creating categories...");
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Added ${createdCategories.length} categories`);

        // Create courses with references
        console.log("🎓 Creating courses...");
        const courses = coursesData.map((course, index) => ({
            ...course,
            instructor: instructor._id,
            category: createdCategories[index % createdCategories.length]._id,
            studentsEnrolled: [],
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const createdCourses = await Course.insertMany(courses);
        console.log(`✅ Added ${createdCourses.length} courses`);

        // Update instructor with course references
        console.log("🔗 Updating references...");
        await User.findByIdAndUpdate(
            instructor._id,
            { $push: { courses: { $each: createdCourses.map(course => course._id) } } }
        );

        // Update categories with course references
        for (const course of createdCourses) {
            await Category.findByIdAndUpdate(
                course.category,
                { $push: { courses: course._id } }
            );
        }
        console.log("✅ Updated all references");

        // Close connection
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        console.log("🎉 Database seeding completed successfully!");

        return { 
            success: true, 
            message: "Database seeded successfully",
            data: {
                categories: createdCategories.length,
                courses: createdCourses.length,
                users: 1
            }
        };

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        throw error;
    }
};

// Export the seed function for use in other files
module.exports = { seedDatabase };

// Run the seed function only if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then((result) => {
            console.log("Seeding result:", result);
            process.exit(0);
        })
        .catch((error) => {
            console.error("Seeding failed:", error);
            process.exit(1);
        });
}
