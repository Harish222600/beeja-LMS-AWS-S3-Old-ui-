const mongoose = require('mongoose');

// MongoDB Atlas connection - requires MONGODB_URL environment variable
const MONGO_URI = process.env.MONGODB_URL;

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

// Validate and normalize the MongoDB URI
const VALIDATED_MONGO_URI = validateMongoURI(MONGO_URI);

// Connection state tracking
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

// Setup connection event handlers
const setupConnectionHandlers = () => {
    // Connection successful
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
        connectionRetries = 0;
        isConnecting = false;
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error.message);
        
        // Don't attempt reconnection if we're already connecting
        if (!isConnecting && connectionRetries < MAX_RETRIES) {
            console.log('🔄 Attempting to reconnect to MongoDB...');
            reconnectWithDelay();
        }
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        
        // Don't attempt reconnection if we're already connecting or if we've exceeded retries
        if (!isConnecting && connectionRetries < MAX_RETRIES) {
            console.log('🔄 Attempting to reconnect to MongoDB...');
            reconnectWithDelay();
        }
    });

    // Connection reconnected
    mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected successfully');
        connectionRetries = 0;
        isConnecting = false;
    });

    // Process termination handlers
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGUSR2', gracefulShutdown); // For nodemon restarts
};

// Reconnect with exponential backoff
const reconnectWithDelay = async () => {
    if (isConnecting) {
        return;
    }

    isConnecting = true;
    connectionRetries++;
    
    const delay = Math.min(1000 * Math.pow(2, connectionRetries - 1), 30000); // Max 30 seconds
    console.log(`⏳ Waiting ${delay}ms before reconnection attempt ${connectionRetries}/${MAX_RETRIES}`);
    
    setTimeout(async () => {
        try {
            if (mongoose.connection.readyState === 0) { // Disconnected
                await mongoose.connect(VALIDATED_MONGO_URI, getConnectionOptions());
            }
        } catch (error) {
            console.error('❌ Reconnection failed:', error.message);
            isConnecting = false;
            
            if (connectionRetries >= MAX_RETRIES) {
                console.error('💀 Max reconnection attempts reached. Manual intervention required.');
            }
        }
    }, delay);
};

// Get connection options
const getConnectionOptions = () => {
    return {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 5000,
        retryWrites: true,
        retryReads: true
    };
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
    
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
};

// Check if database is connected
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Get connection status
const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    return {
        state: states[mongoose.connection.readyState] || 'unknown',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
    };
};

// Main connection function
exports.connectDB = async () => {
    let retries = 5;
    
    const connectWithRetry = async () => {
        try {
            const options = getConnectionOptions();

            console.log('Attempting to connect to database...');
            console.log('MongoDB URI:', VALIDATED_MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
            
            // Setup event handlers before connecting
            setupConnectionHandlers();
            
            await mongoose.connect(VALIDATED_MONGO_URI, options);
            console.log("Database connected successfully");

            // Create indexes for better performance
            try {
                await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
                await mongoose.connection.db.collection('users').createIndex({ accountType: 1 });
                console.log("Database indexes created successfully");
            } catch (indexError) {
                console.warn("Warning: Could not create indexes:", indexError.message);
            }
            
        } catch (error) {
            console.error("Error while connecting to Database:", {
                message: error.message,
                code: error.code,
                uri: VALIDATED_MONGO_URI.replace(/\/\/.*@/, '//***:***@') // Hide credentials in error logs
            });
            
            if (retries > 0) {
                retries--;
                console.log(`Retrying connection... (${retries} attempts remaining)`);
                // Wait for 5 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
                return connectWithRetry();
            } else {
                console.log("Max retries reached. Exiting...");
                process.exit(1);
            }
        }
    };

    await connectWithRetry();
};

// Export utility functions
exports.isConnected = isConnected;
exports.getConnectionStatus = getConnectionStatus;
exports.gracefulShutdown = gracefulShutdown;
