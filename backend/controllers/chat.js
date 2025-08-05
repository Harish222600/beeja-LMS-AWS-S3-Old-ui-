const Chat = require('../models/chat');
const Message = require('../models/message');
const Course = require('../models/course');
const User = require('../models/user');
const Notification = require('../models/notification');
const { uploadImageToS3 } = require('../utils/s3Uploader');

// ================ STUDENT FUNCTIONS ================

// Initiate or get existing chat with instructor
exports.initiateChat = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.id;

        console.log('Initiating chat for student:', studentId, 'course:', courseId);

        // Verify student is enrolled in the course
        const course = await Course.findById(courseId).populate('instructor', 'firstName lastName email');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if student is enrolled
        if (!course.studentsEnrolled.includes(studentId)) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to chat with the instructor'
            });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            student: studentId,
            course: courseId
        }).populate([
            { path: 'student', select: 'firstName lastName email image' },
            { path: 'instructor', select: 'firstName lastName email image' },
            { path: 'course', select: 'courseName' },
            { path: 'lastMessage' }
        ]);

        if (!chat) {
            // Create new chat
            chat = new Chat({
                student: studentId,
                instructor: course.instructor._id,
                course: courseId
            });
            await chat.save();

            // Populate the newly created chat
            chat = await Chat.findById(chat._id).populate([
                { path: 'student', select: 'firstName lastName email image' },
                { path: 'instructor', select: 'firstName lastName email image' },
                { path: 'course', select: 'courseName' },
                { path: 'lastMessage' }
            ]);

            // Create system message
            const systemMessage = new Message({
                chat: chat._id,
                sender: studentId,
                messageType: 'text',
                content: 'Chat started',
                isSystemMessage: true
            });
            await systemMessage.save();

            // Send notification to instructor
            const notification = new Notification({
                recipientType: 'Specific',
                recipients: [course.instructor._id],
                type: 'NEW_STUDENT_CHAT',
                title: 'New Chat Request',
                message: `${req.user.firstName} ${req.user.lastName} started a chat about ${course.courseName}`,
                sender: studentId,
                relatedCourse: courseId,
                actionUrl: `/dashboard/instructor-chats/${chat._id}`,
                priority: 'medium'
            });
            await notification.save();

            // Emit socket notification to instructor
            const io = req.app.get('io');
            if (io) {
                io.to(course.instructor._id.toString()).emit('new_notification', {
                    type: 'NEW_STUDENT_CHAT',
                    message: `${req.user.firstName} ${req.user.lastName} started a chat about ${course.courseName}`,
                    chatId: chat._id,
                    notification: notification
                });
                console.log(`New chat notification emitted to instructor ${course.instructor._id}`);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Chat initiated successfully',
            data: chat
        });

    } catch (error) {
        console.error('Error initiating chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error initiating chat',
            error: error.message
        });
    }
};

// Get student's chats
exports.getStudentChats = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const chats = await Chat.find({
            student: studentId,
            isActive: true
        })
        .populate([
            { path: 'instructor', select: 'firstName lastName email image' },
            { path: 'course', select: 'courseName thumbnail' },
            { path: 'lastMessage' }
        ])
        .sort({ lastMessageTime: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const totalChats = await Chat.countDocuments({
            student: studentId,
            isActive: true
        });

        res.status(200).json({
            success: true,
            message: 'Student chats retrieved successfully',
            data: {
                chats,
                totalPages: Math.ceil(totalChats / limit),
                currentPage: page,
                totalChats
            }
        });

    } catch (error) {
        console.error('Error getting student chats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving chats',
            error: error.message
        });
    }
};

// ================ INSTRUCTOR FUNCTIONS ================

// Get instructor's chats
exports.getInstructorChats = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { page = 1, limit = 10, courseId } = req.query;

        let query = {
            instructor: instructorId,
            isActive: true
        };

        if (courseId) {
            query.course = courseId;
        }

        const chats = await Chat.find(query)
        .populate([
            { path: 'student', select: 'firstName lastName email image' },
            { path: 'course', select: 'courseName thumbnail' },
            { path: 'lastMessage' }
        ])
        .sort({ lastMessageTime: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const totalChats = await Chat.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Instructor chats retrieved successfully',
            data: {
                chats,
                totalPages: Math.ceil(totalChats / limit),
                currentPage: page,
                totalChats
            }
        });

    } catch (error) {
        console.error('Error getting instructor chats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving chats',
            error: error.message
        });
    }
};

// ================ ADMIN FUNCTIONS ================

// Get all chats for admin
exports.getAllChats = async (req, res) => {
    try {
        const { page = 1, limit = 10, courseId, instructorId, studentId, status = 'active' } = req.query;

        let query = {};

        if (courseId) query.course = courseId;
        if (instructorId) query.instructor = instructorId;
        if (studentId) query.student = studentId;

        switch (status) {
            case 'active':
                query.isActive = true;
                query.isArchived = false;
                break;
            case 'archived':
                query.isArchived = true;
                break;
            case 'flagged':
                query.isFlagged = true;
                break;
            case 'all':
                // No additional filters
                break;
        }

        const chats = await Chat.find(query)
        .populate([
            { path: 'student', select: 'firstName lastName email image' },
            { path: 'instructor', select: 'firstName lastName email image' },
            { path: 'course', select: 'courseName thumbnail' },
            { path: 'lastMessage' },
            { path: 'moderatedBy', select: 'firstName lastName' }
        ])
        .sort({ lastMessageTime: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const totalChats = await Chat.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'All chats retrieved successfully',
            data: {
                chats,
                totalPages: Math.ceil(totalChats / limit),
                currentPage: page,
                totalChats
            }
        });

    } catch (error) {
        console.error('Error getting all chats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving chats',
            error: error.message
        });
    }
};

// Archive chat (Admin only)
exports.archiveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const adminId = req.user.id;

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            {
                isArchived: true,
                moderatedBy: adminId,
                moderatedAt: new Date()
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat archived successfully',
            data: chat
        });

    } catch (error) {
        console.error('Error archiving chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error archiving chat',
            error: error.message
        });
    }
};

// Flag chat (Admin only)
exports.flagChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            {
                isFlagged: true,
                flagReason: reason,
                moderatedBy: adminId,
                moderatedAt: new Date()
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat flagged successfully',
            data: chat
        });

    } catch (error) {
        console.error('Error flagging chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error flagging chat',
            error: error.message
        });
    }
};

// Unflag chat (Admin only)
exports.unflagChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const adminId = req.user.id;

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            {
                isFlagged: false,
                flagReason: null,
                moderatedBy: adminId,
                moderatedAt: new Date()
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat unflagged successfully',
            data: chat
        });

    } catch (error) {
        console.error('Error unflagging chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error unflagging chat',
            error: error.message
        });
    }
};

// Unarchive chat (Admin only)
exports.unarchiveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const adminId = req.user.id;

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            {
                isArchived: false,
                moderatedBy: adminId,
                moderatedAt: new Date()
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat unarchived successfully',
            data: chat
        });

    } catch (error) {
        console.error('Error unarchiving chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error unarchiving chat',
            error: error.message
        });
    }
};

// Delete chat (Admin only)
exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Delete all messages in the chat first
        await Message.deleteMany({ chat: chatId });

        // Delete the chat
        const chat = await Chat.findByIdAndDelete(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting chat',
            error: error.message
        });
    }
};

// ================ MESSAGE FUNCTIONS ================

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { chatId, content, messageType = 'text' } = req.body;
        const senderId = req.user.id;
        let imageUrl = null;

        console.log('Sending message:', { 
            chatId, 
            messageType, 
            senderId, 
            hasFile: !!req.file,
            fileDetails: req.file ? { 
                originalname: req.file.originalname, 
                mimetype: req.file.mimetype, 
                size: req.file.size 
            } : null
        });

        // Verify chat exists and user has access
        const chat = await Chat.findById(chatId).populate('course');
        if (!chat) {
            console.log('Chat not found:', chatId);
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Check if user is part of this chat or is admin
        const isStudent = chat.student.toString() === senderId;
        const isInstructor = chat.instructor.toString() === senderId;
        const isAdmin = req.user.accountType === 'Admin';

        console.log('Access check:', { isStudent, isInstructor, isAdmin });

        if (!isStudent && !isInstructor && !isAdmin) {
            console.log('Access denied for user:', senderId);
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to send messages in this chat'
            });
        }

        // Handle image upload if messageType is image
        if (messageType === 'image') {
            if (!req.file) {
                console.log('No file provided for image message');
                return res.status(400).json({
                    success: false,
                    message: 'Image file is required for image messages'
                });
            }

            console.log('Starting image upload process...', {
                file: {
                    fieldname: req.file.fieldname,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
            });

            // Validate file type
            if (!req.file.mimetype.startsWith('image/')) {
                console.error('Invalid file type:', req.file.mimetype);
                return res.status(400).json({
                    success: false,
                    message: 'Only image files are allowed'
                });
            }

            // Validate file size (5MB limit)
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (req.file.size > MAX_SIZE) {
                console.error('File too large:', req.file.size);
                return res.status(400).json({
                    success: false,
                    message: 'File size must be less than 5MB'
                });
            }

            console.log('Uploading image to S3...');

            const uploadResult = await uploadImageToS3(req.file, 'chat-files');
            console.log('✅ Chat image uploaded to S3:', uploadResult.secure_url);
            
            console.log('Upload result received:', uploadResult);
            
            if (!uploadResult || !uploadResult.secure_url) {
                console.error('Cloudinary upload failed:', uploadResult);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image',
                    error: uploadResult
                });
            }
            
            imageUrl = uploadResult.secure_url;
            console.log('Image uploaded successfully:', {
                secure_url: imageUrl,
                public_id: uploadResult.public_id,
                format: uploadResult.format,
                bytes: uploadResult.bytes,
                created_at: uploadResult.created_at
            });
        }

        // Create message
        const message = new Message({
            chat: chatId,
            sender: senderId,
            messageType,
            content: messageType === 'image' ? (content || 'Image') : content,
            imageUrl
        });

        await message.save();
        console.log('Message saved to database:', message._id);

        // Update chat's last message and timestamp
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
            lastMessageTime: new Date(),
            // Update unread counts
            ...(isStudent ? { unreadByInstructor: chat.unreadByInstructor + 1 } : { unreadByStudent: chat.unreadByStudent + 1 })
        });

        // Populate message for response
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'firstName lastName image');

        // Send notification to recipient
        const recipientId = isStudent ? chat.instructor : chat.student;
        const senderName = `${req.user.firstName} ${req.user.lastName}`;
        
        const notification = new Notification({
            recipientType: 'Specific',
            recipients: [recipientId],
            type: 'NEW_CHAT_MESSAGE',
            title: 'New Message',
            message: `${senderName} sent you a message about ${chat.course.courseName}`,
            sender: senderId,
            relatedCourse: chat.course._id,
            actionUrl: `/dashboard/chats/${chatId}`,
            priority: 'medium'
        });
        await notification.save();

        // Emit socket events for real-time updates
        const io = req.app.get('io');
        if (io) {
            // Emit new message to chat room
            io.to(chatId).emit('new_message', populatedMessage);
            
            // Emit notification to recipient
            io.to(recipientId.toString()).emit('new_notification', {
                type: 'NEW_CHAT_MESSAGE',
                message: `${senderName} sent you a message about ${chat.course.courseName}`,
                chatId: chatId,
                notification: notification
            });
            
            console.log(`Socket events emitted for chat ${chatId} and recipient ${recipientId}`);
        }

        console.log('Message sent successfully');
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: populatedMessage
        });

    } catch (error) {
        console.error('Error sending message:', {
            message: error.message,
            stack: error.stack,
            chatId: req.body?.chatId,
            messageType: req.body?.messageType,
            senderId: req.user?.id
        });
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

// Get messages for a chat
exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user.id;

        // Verify user has access to this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const isStudent = chat.student.toString() === userId;
        const isInstructor = chat.instructor.toString() === userId;
        const isAdmin = req.user.accountType === 'Admin';

        if (!isStudent && !isInstructor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this chat'
            });
        }

        // Get messages
        const messages = await Message.find({
            chat: chatId,
            isHidden: false
        })
        .populate('sender', 'firstName lastName image')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        // Mark messages as read by current user
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: userId },
                'readBy.user': { $ne: userId }
            },
            {
                $push: {
                    readBy: {
                        user: userId,
                        readAt: new Date()
                    }
                }
            }
        );

        // Reset unread count for current user
        const updateField = isStudent ? { unreadByStudent: 0 } : { unreadByInstructor: 0 };
        await Chat.findByIdAndUpdate(chatId, updateField);

        const totalMessages = await Message.countDocuments({
            chat: chatId,
            isHidden: false
        });

        res.status(200).json({
            success: true,
            message: 'Messages retrieved successfully',
            data: {
                messages: messages.reverse(), // Reverse to show oldest first
                totalPages: Math.ceil(totalMessages / limit),
                currentPage: page,
                totalMessages
            }
        });

    } catch (error) {
        console.error('Error getting chat messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving messages',
            error: error.message
        });
    }
};

// Hide message (Admin only)
exports.hideMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const message = await Message.findByIdAndUpdate(
            messageId,
            {
                isHidden: true,
                hiddenBy: adminId,
                hiddenReason: reason,
                hiddenAt: new Date()
            },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message hidden successfully',
            data: message
        });

    } catch (error) {
        console.error('Error hiding message:', error);
        res.status(500).json({
            success: false,
            message: 'Error hiding message',
            error: error.message
        });
    }
};

// Get chat details
exports.getChatDetails = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const chat = await Chat.findById(chatId).populate([
            { path: 'student', select: 'firstName lastName email image' },
            { path: 'instructor', select: 'firstName lastName email image' },
            { path: 'course', select: 'courseName thumbnail' },
            { path: 'lastMessage' }
        ]);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Check access permissions
        const isStudent = chat.student._id.toString() === userId;
        const isInstructor = chat.instructor._id.toString() === userId;
        const isAdmin = req.user.accountType === 'Admin';

        if (!isStudent && !isInstructor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this chat'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat details retrieved successfully',
            data: chat
        });

    } catch (error) {
        console.error('Error getting chat details:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving chat details',
            error: error.message
        });
    }
};
