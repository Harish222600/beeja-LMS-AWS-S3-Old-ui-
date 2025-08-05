const mongoose = require('mongoose');

const courseAccessRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    requestMessage: {
        type: String,
        maxlength: 500
    },
    adminResponse: {
        type: String,
        maxlength: 500
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    responseDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure a user can only have one pending request per course
courseAccessRequestSchema.index({ user: 1, course: 1 }, { 
    unique: true,
    partialFilterExpression: { status: 'Pending' }
});

module.exports = mongoose.model('CourseAccessRequest', courseAccessRequestSchema);
