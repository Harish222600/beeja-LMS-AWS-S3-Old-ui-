// AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

const jwt = require("jsonwebtoken");
const TokenBlacklist = require('../models/tokenBlacklist');
require('dotenv').config();


// ================ AUTH ================
// user Authentication by checking token validating
exports.auth = async (req, res, next) => {
    try {
        console.log('=== AUTH MIDDLEWARE START ===');
        console.log('Auth middleware called for:', req.method, req.url);
        console.log('Request path:', req.path);
        console.log('Request params:', req.params);
        
        // extract token by anyone from this 3 ways
        const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

        console.log('Token extraction:', {
            fromBody: !!req.body?.token,
            fromCookies: !!req.cookies?.token,
            fromHeaders: !!req.header('Authorization'),
            tokenExists: !!token,
            authHeader: req.header('Authorization'),
            tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });

        // if token is missing
        if (!token) {
            console.log('❌ Token is missing - returning 401');
            return res.status(401).json({
                success: false,
                message: 'Token is Missing'
            });
        }

        // Check if token is blacklisted
        try {
            console.log('Checking if token is blacklisted...');
            
            // First decode the token to get user ID (without verification)
            let userId = null;
            try {
                const decoded = jwt.decode(token);
                userId = decoded?.id;
            } catch (decodeError) {
                console.log('Could not decode token for blacklist check');
            }
            
            // Check for specific token blacklist
            const blacklistedToken = await TokenBlacklist.findOne({ token });
            if (blacklistedToken) {
                console.log('❌ Specific token is blacklisted');
                return res.status(401).json({
                    success: false,
                    message: 'Token has been invalidated. Please login again.',
                    reason: 'TOKEN_BLACKLISTED'
                });
            }
            
            // Check for user-wide token blacklist (when user is deleted/suspended)
            if (userId) {
                const userTokenIdentifier = `USER_${userId}_ALL_TOKENS`;
                const userBlacklisted = await TokenBlacklist.findOne({ token: userTokenIdentifier });
                if (userBlacklisted) {
                    console.log('❌ All tokens for user are blacklisted - user was deleted/suspended');
                    return res.status(401).json({
                        success: false,
                        message: 'Your account has been deactivated. Please contact support.',
                        reason: 'USER_DEACTIVATED'
                    });
                }
            }
            
            console.log('✅ Token is not blacklisted');
        } catch (error) {
            console.log('❌ Error checking token blacklist:', error.message);
            // Continue with token verification even if blacklist check fails
        }

        // verify token
        try {
            console.log('Verifying token...');
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verified successfully:', {
                email: decode.email,
                accountType: decode.accountType,
                id: decode.id
            });
            
            // Additional check: Verify if user is still active in database
            try {
                const User = require('../models/user');
                const currentUser = await User.findById(decode.id);
                
                if (!currentUser) {
                    console.log('❌ User not found in database');
                    return res.status(401).json({
                        success: false,
                        message: 'User account not found. Please login again.',
                        reason: 'USER_NOT_FOUND'
                    });
                }
                
                if (!currentUser.active) {
                    console.log('❌ User account is inactive/deleted');
                    return res.status(401).json({
                        success: false,
                        message: 'Your account has been deactivated. Please contact support.',
                        reason: 'USER_DEACTIVATED'
                    });
                }
                
                console.log('✅ User is active in database');
            } catch (dbError) {
                console.log('❌ Error checking user status in database:', dbError.message);
                // Continue with normal flow if database check fails
            }
            
            req.user = decode;
            console.log('✅ User set in request object');
        }
        catch (error) {
            console.log('❌ Error while decoding token:', error.message);
            console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
            console.log('Token that failed:', token.substring(0, 50) + '...');
            return res.status(401).json({
                success: false,
                error: error.message,
                messgae: 'Error while decoding token'
            })
        }
        
        console.log('✅ Auth middleware completed successfully - calling next()');
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('❌ Unexpected error in auth middleware:', error.message);
        console.log('Error stack:', error.stack);
        return res.status(500).json({
            success: false,
            messgae: 'Error while token validating'
        })
    }
}





// ================ IS STUDENT ================
exports.isStudent = (req, res, next) => {
    try {
        // console.log('User data -> ', req.user)
        if (req.user?.accountType != 'Student') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for student'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with student accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with student accountType'
        })
    }
}


// ================ IS INSTRUCTOR ================
exports.isInstructor = (req, res, next) => {
    try {
        console.log('=== IS INSTRUCTOR MIDDLEWARE START ===');
        console.log('Checking instructor status for request:', req.method, req.url);
        console.log('User object from request:', req.user);
        
        if (!req.user) {
            console.log('❌ No user object found in request');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Allow both Instructors and Admins
        if (req.user?.accountType !== 'Instructor' && req.user?.accountType !== 'Admin') {
            console.log('❌ User is not instructor or admin:', req.user.accountType);
            return res.status(401).json({
                success: false,
                message: 'This page is protected for Instructors and Admins only',
                currentRole: req.user.accountType
            })
        }
        
        console.log('✅ User verified as Instructor/Admin:', req.user.accountType);
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('❌ Error in isInstructor middleware:', error.message);
        console.log('Error stack:', error.stack);
        console.log('Request user at time of error:', req.user);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity with Instructor/Admin accountType'
        })
    }
}


// ================ IS ADMIN ================
exports.isAdmin = (req, res, next) => {
    try {
        console.log('=== IS ADMIN MIDDLEWARE START ===');
        console.log('Checking admin status for request:', req.method, req.url);
        console.log('User object from request:', req.user);
        
        if (!req.user) {
            console.log('❌ No user object found in request');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (req.user.accountType !== 'Admin') {
            console.log('❌ User is not admin:', req.user.accountType);
            return res.status(401).json({
                success: false,
                message: 'This page is protected for Admin only',
                currentRole: req.user.accountType
            });
        }

        console.log('✅ User verified as Admin');
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('❌ Error in isAdmin middleware:', error.message);
        console.log('Error stack:', error.stack);
        console.log('Request user at time of error:', req.user);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking admin status'
        });
    }
}


