const ContactMessage = require("../models/contactMessage");
const mailSender = require("../utils/mailSender");

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { firstname, lastname, email, phoneNo, countrycode, message } = req.body;

    // Validate required fields
    if (!firstname || !email || !phoneNo || !countrycode || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      firstname,
      lastname,
      email,
      phoneNo,
      countrycode,
      message,
    });

    // Send confirmation email to user
    try {
      await mailSender(
        email,
        "Thank you for contacting us - Beeja Academy",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for reaching out!</h2>
          <p>Dear ${firstname},</p>
          <p>We have received your message and will get back to you within 24-48 hours.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p>${message}</p>
          </div>
          <p>Best regards,<br>Beeja Academy Team</p>
        </div>`
      );
    } catch (emailError) {
      console.log("Error sending confirmation email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contactMessage,
    });

  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all contact messages (Admin only)
exports.getAllContactMessages = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;

    // Build filter object
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive
      filter.$or = [
        { firstname: searchRegex },
        { lastname: searchRegex },
        { email: searchRegex }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        // Set to start of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully",
      data: messages,
    });

  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark message as read (Admin only)
exports.markMessageAsRead = async (req, res) => {
  try {
    console.log('=== MARK AS READ CONTROLLER START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Request headers authorization:', req.headers.authorization);
    
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      console.log('No user found in request - auth middleware may have failed');
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user is admin (should be verified by isAdmin middleware)
    if (req.user.accountType !== 'Admin') {
      console.log('User is not admin:', req.user.accountType);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    
    const { messageId } = req.params;
    
    console.log('Marking message as read - messageId:', messageId);

    // Validate ObjectId format
    if (!messageId || !messageId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid messageId format');
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    console.log('MessageId validation passed');

    // Test database connection
    console.log('Testing database connection...');
    try {
      const testConnection = await ContactMessage.findOne().limit(1);
      console.log('Database connection test successful');
    } catch (dbError) {
      console.error('Database connection test failed:', dbError);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
        error: dbError.message,
      });
    }

    // First check if the message exists
    console.log('Searching for message in database...');
    const existingMessage = await ContactMessage.findById(messageId);
    console.log('Database search result:', existingMessage);

    if (!existingMessage) {
      console.log('Message not found in database');
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    console.log('Message found, current status:', existingMessage.status);

    // Only update if the message is unread
    if (existingMessage.status === "read") {
      console.log('Message already marked as read');
      return res.status(200).json({
        success: true,
        message: "Message is already marked as read",
        data: existingMessage,
      });
    }

    console.log('Updating message status to read...');
    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { 
        new: true,
        runValidators: true
      }
    );

    console.log('Update successful, updated message:', message);

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });

  } catch (error) {
    console.error("=== ERROR IN MARK AS READ ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      console.log('Validation error detected');
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }
    
    // Check if it's a Mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      console.log('Cast error detected');
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        error: error.message,
      });
    }

    console.log('Returning 500 error');
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete contact message (Admin only)
exports.deleteContactMessage = async (req, res) => {
  try {
    console.log('=== DELETE MESSAGE CONTROLLER START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Request headers authorization:', req.headers.authorization);
    
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      console.log('No user found in request - auth middleware may have failed');
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user is admin (should be verified by isAdmin middleware)
    if (req.user.accountType !== 'Admin') {
      console.log('User is not admin:', req.user.accountType);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    
    const { messageId } = req.params;
    
    console.log('Deleting message - messageId:', messageId);

    // Validate ObjectId format
    if (!messageId || !messageId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid messageId format');
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    console.log('MessageId validation passed');

    // Test database connection
    console.log('Testing database connection...');
    try {
      const testConnection = await ContactMessage.findOne().limit(1);
      console.log('Database connection test successful');
    } catch (dbError) {
      console.error('Database connection test failed:', dbError);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
        error: dbError.message,
      });
    }

    // First check if the message exists
    console.log('Searching for message in database...');
    const existingMessage = await ContactMessage.findById(messageId);
    console.log('Database search result:', existingMessage);

    if (!existingMessage) {
      console.log('Message not found in database');
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    console.log('Message found, proceeding with deletion...');
    const message = await ContactMessage.findByIdAndDelete(messageId);

    console.log('Deletion successful, deleted message:', message);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: {
        deletedMessage: {
          id: message._id,
          firstname: message.firstname,
          lastname: message.lastname,
          email: message.email
        }
      }
    });

  } catch (error) {
    console.error("=== ERROR IN DELETE MESSAGE ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      console.log('Validation error detected');
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }
    
    // Check if it's a Mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      console.log('Cast error detected');
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        error: error.message,
      });
    }

    console.log('Returning 500 error');
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get contact message statistics (Admin only)
exports.getContactMessageStats = async (req, res) => {
  try {
    const totalMessages = await ContactMessage.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ status: "unread" });
    const readMessages = await ContactMessage.countDocuments({ status: "read" });

    // Get messages from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMessages = await ContactMessage.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    return res.status(200).json({
      success: true,
      message: "Contact message statistics fetched successfully",
      data: {
        total: totalMessages,
        unread: unreadMessages,
        read: readMessages,
        recent: recentMessages,
      },
    });

  } catch (error) {
    console.error("Error fetching contact message stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
