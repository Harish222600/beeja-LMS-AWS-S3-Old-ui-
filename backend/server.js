require('dotenv').config(); 
const express = require('express')
const app = express();
const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// packages
// const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// connection to DB and AWS S3
const { connectDB, isConnected, getConnectionStatus } = require('./config/database');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const adminRoutes = require('./routes/admin');
const studentProgressRoutes = require('./routes/admin/studentProgress');
const courseAccessRoutes = require('./routes/courseAccess');
const quizRoutes = require('./routes/quiz');
const certificateRoutes = require('./routes/certificate');
const notificationRoutes = require('./routes/notification');
const contactMessageRoutes = require('./routes/contactMessage');
const featuredCoursesRoutes = require('./routes/featuredCourses');
const faqRoutes = require('./routes/faq.js');
const userAnalyticsRoutes = require('./routes/userAnalytics');
const chatRoutes = require('./routes/chat');
const jobRoutes = require('./routes/jobs');
const jobApplicationRoutes = require('./routes/jobApplications');
const recycleBinRoutes = require('./routes/recycleBin');
const uploadRoutes = require('./routes/upload');
const chunkedUploadRoutes = require('./routes/chunkedUpload');
const videoPlaybackRoutes = require('./routes/videoPlayback');

// middleware 
app.use(cookieParser());

// CORS configuration
const getAllowedOrigins = () => {
    const origins = [];
    
    // Add environment-specific frontend URLs
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }
    
    // Add localhost for development
    origins.push('http://localhost:5173');
    origins.push('http://localhost:5174');
    
    // Add public IP URLs if available
    if (process.env.PUBLIC_IP) {
        origins.push(`http://${process.env.PUBLIC_IP}:5173`);
        origins.push(`https://${process.env.PUBLIC_IP}:5173`);
    }
    
    // Remove duplicates
    return [...new Set(origins)];
};

const corsOptions = {
    origin: getAllowedOrigins(), // Dynamic frontend URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Socket.io configuration
const io = socketIo(server, {
    cors: {
        origin: getAllowedOrigins(), // Use same dynamic origins
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io connection handling
const jwt = require('jsonwebtoken');
const Chat = require('./models/chat');
const Message = require('./models/message');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.accountType;
            
            // Join user-specific room for notifications
            socket.join(decoded.id);
            
            console.log(`User ${decoded.id} authenticated with role ${decoded.accountType} and joined personal room`);
            socket.emit('authenticated', { success: true });
        } catch (error) {
            console.error('Socket authentication failed:', error);
            socket.emit('authentication_error', { message: 'Invalid token' });
        }
    });

    // Join chat room
    socket.on('join_chat', async (chatId) => {
        try {
            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify user has access to this chat
            const chat = await Chat.findById(chatId);
            if (!chat) {
                socket.emit('error', { message: 'Chat not found' });
                return;
            }

            const hasAccess = chat.student.toString() === socket.userId || 
                            chat.instructor.toString() === socket.userId || 
                            socket.userRole === 'Admin';

            if (!hasAccess) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }

            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
            socket.emit('joined_chat', { chatId });

        } catch (error) {
            console.error('Error joining chat:', error);
            socket.emit('error', { message: 'Error joining chat' });
        }
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
        try {
            const { chatId, content, messageType = 'text' } = data;

            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify chat access
            const chat = await Chat.findById(chatId);
            if (!chat) {
                socket.emit('error', { message: 'Chat not found' });
                return;
            }

            const hasAccess = chat.student.toString() === socket.userId || 
                            chat.instructor.toString() === socket.userId || 
                            socket.userRole === 'Admin';

            if (!hasAccess) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }

            // Create and save message
            const message = new Message({
                chat: chatId,
                sender: socket.userId,
                messageType,
                content
            });

            await message.save();

            // Update chat's last message
            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: message._id,
                lastMessageTime: new Date()
            });

            // Populate message for broadcasting
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'firstName lastName image');

            // Broadcast to all users in the chat room
            io.to(chatId).emit('new_message', populatedMessage);

            console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Error sending message' });
        }
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId) => {
        socket.to(chatId).emit('user_typing', { userId: socket.userId, typing: true });
    });

    socket.on('typing_stop', (chatId) => {
        socket.to(chatId).emit('user_typing', { userId: socket.userId, typing: false });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

// Body parser middleware with increased limits
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Increase timeout for large uploads
app.use((req, res, next) => {
    res.setTimeout(300000); // 5 minutes timeout
    next();
});

// Database connection health check middleware
app.use('/api', (req, res, next) => {
    if (!isConnected()) {
        const status = getConnectionStatus();
        console.error('❌ Database not connected for API request:', {
            method: req.method,
            url: req.url,
            connectionStatus: status
        });
        
        return res.status(503).json({
            success: false,
            message: 'Database connection unavailable. Please try again later.',
            error: 'SERVICE_UNAVAILABLE',
            connectionStatus: status.state
        });
    }
    next();
});

// Log all incoming requests (after body parsing)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    next();
});

// mount routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin', studentProgressRoutes);
app.use('/api/v1/course-access', courseAccessRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/certificate', certificateRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/contact', contactMessageRoutes);
app.use('/api/v1/featured-courses', featuredCoursesRoutes);
// FAQ Routes
app.use('/api/v1/faqs', faqRoutes);
// User Analytics Routes
app.use('/api/v1/user', userAnalyticsRoutes);
// Chat Routes
app.use('/api/v1/chat', chatRoutes);
// Job Routes
app.use('/api/v1/jobs', jobRoutes);
// Job Application Routes
app.use('/api/v1/job-applications', jobApplicationRoutes);
// Recycle Bin Routes
app.use('/api/v1/recycle-bin', recycleBinRoutes);
// Direct Upload Routes
app.use('/api/v1/upload', uploadRoutes);
// Chunked Upload Routes (S3 Multipart)
app.use('/api/v1/chunked-upload', chunkedUploadRoutes);
// Video Playback Routes
app.use('/api/v1/video', videoPlaybackRoutes);

// Health check route
app.get('/health', (req, res) => {
    const dbStatus = getConnectionStatus();
    const isDbConnected = isConnected();
    
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
            connected: isDbConnected,
            ...dbStatus
        },
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        }
    });
});

// Database monitoring route
app.get('/api/v1/admin/db-monitor', (req, res) => {
    try {
        const report = connectionMonitor.getDetailedReport();
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting database monitoring report',
            error: error.message
        });
    }
});

// Database connection test route
app.get('/api/v1/admin/db-test', async (req, res) => {
    try {
        const testResult = await connectionMonitor.testConnection();
        res.status(testResult.success ? 200 : 503).json({
            success: testResult.success,
            data: testResult
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error testing database connection',
            error: error.message
        });
    }
});

// Default Route
app.get('/', (req, res) => {
    const dbStatus = getConnectionStatus();
    const isDbConnected = isConnected();
    
    res.send(`<div>
        <h2>LMS Backend Server</h2>
        <p>✅ Server is running</p>
        <p>Database Status: ${isDbConnected ? '✅ Connected' : '❌ Disconnected'} (${dbStatus.state})</p>
        <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
        <p><a href="/health">Health Check</a></p>
    </div>`);
});

// 404 handler - must come after all routes
app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.url);
    
    const isApiRoute = req.url.startsWith('/api/');
    
    if (isApiRoute) {
        // Return JSON for API routes
        res.status(404).json({
            success: false,
            error: 'Route not found',
            message: `Cannot ${req.method} ${req.url}`,
            timestamp: new Date().toISOString()
        });
    } else {
        // Return HTML for non-API routes
        res.status(404).send(`
            <div>
                <h1>404 - Page Not Found</h1>
                <p>The requested page could not be found.</p>
            </div>
        `);
    }
});

// Error handling middleware for Multer errors and others
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    
    // Ensure we always return JSON for API routes
    const isApiRoute = req.url.startsWith('/api/');
    
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false,
                error: 'File size is too large. Maximum limit is 500MB.',
                code: 'LIMIT_FILE_SIZE'
            });
        }
        return res.status(400).json({ 
            success: false,
            error: err.message,
            code: err.code
        });
    }
    
    // Only handle errors that haven't been handled by route controllers
    if (!res.headersSent) {
        console.error('Unhandled error:', err);
        
        if (isApiRoute) {
            // Always return JSON for API routes
            res.status(500).json({ 
                success: false,
                error: 'An internal server error occurred.',
                message: err.message,
                timestamp: new Date().toISOString(),
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        } else {
            // For non-API routes, return HTML
            res.status(500).send(`
                <div>
                    <h1>Internal Server Error</h1>
                    <p>An error occurred while processing your request.</p>
                    ${process.env.NODE_ENV === 'development' ? `<pre>${err.stack}</pre>` : ''}
                </div>
            `);
        }
    }
});

// Import seed function and connection monitor
const { seedDatabase } = require('./utils/seedData');
const { connectionMonitor } = require('./utils/connectionMonitor');

// S3 Configuration function
const configureS3Bucket = async () => {
    try {
        const { S3Client, PutBucketCorsCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');
        
        const s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

        if (!BUCKET_NAME) {
            console.log('⚠️  S3 bucket name not configured, skipping S3 setup');
            return;
        }

        console.log(`🔧 Configuring S3 bucket: ${BUCKET_NAME}`);

        // Configure CORS
        const corsConfiguration = {
            CORSRules: [
                {
                    AllowedOrigins: ['*'],
                    AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    AllowedHeaders: ['*'],
                    ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
                    MaxAgeSeconds: 3000
                }
            ]
        };

        await s3Client.send(new PutBucketCorsCommand({
            Bucket: BUCKET_NAME,
            CORSConfiguration: corsConfiguration
        }));

        // Configure public access block
        await s3Client.send(new PutPublicAccessBlockCommand({
            Bucket: BUCKET_NAME,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false,
                RestrictPublicBuckets: false
            }
        }));

        // Configure bucket policy
        const bucketPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
                }
            ]
        };

        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(bucketPolicy)
        }));

        console.log('✅ S3 bucket configured successfully (CORS, public access, bucket policy)');
    } catch (error) {
        console.warn('⚠️  S3 configuration failed (this is normal if bucket is already configured):', error.message);
        console.log('🗄️ Continuing with server startup...');
    }
};

// Startup function to handle initialization
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Configure S3 bucket automatically if enabled
        if (process.env.AUTO_CONFIGURE_S3 !== 'false') {
            await configureS3Bucket();
        } else {
            console.log('ℹ️  S3 auto-configuration disabled (AUTO_CONFIGURE_S3=false)');
        }
        
        // AWS S3 is ready to use
        console.log('🗄️ AWS S3 storage is configured and ready');
        
        // Run seed data if SEED_DATABASE environment variable is set to true
        if (process.env.SEED_DATABASE === 'true') {
            console.log('🌱 SEED_DATABASE is enabled, running database seeding...');
            try {
                const seedResult = await seedDatabase();
                console.log('✅ Seeding completed:', seedResult.message);
            } catch (seedError) {
                console.error('❌ Seeding failed:', seedError.message);
                console.log('⚠️  Server will continue without seeding...');
            }
        } else {
            console.log('ℹ️  Database seeding skipped (SEED_DATABASE not set to true)');
        }
        
        // Initialize recycle bin cleanup scheduler
        const { scheduleCleanup } = require('./scripts/recycleBinCleanup');
        scheduleCleanup();

        // Start connection monitoring
        connectionMonitor.startMonitoring(30000); // Check every 30 seconds

        // Start the server
        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => {
            console.log(`🚀 Server Started on PORT ${PORT}`);
            const serverHost = process.env.PUBLIC_IP || process.env.HOST || 'localhost';
            console.log(`🔌 Socket.IO server is running on http://${serverHost}:${PORT}`);
            console.log('🔍 Database connection monitoring started');
            console.log('✅ Server initialization completed successfully!');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
