const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true
        },
        applicantName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        resume: {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            },
            originalName: {
                type: String,
                required: true
            }
        },
        coverLetter: {
            type: String,
            trim: true
        },
        experience: {
            type: String,
            trim: true
        },
        portfolio: {
            type: String,
            trim: true
        },
        linkedinProfile: {
            type: String,
            trim: true
        },
        expectedSalary: {
            type: Number
        },
        availableStartDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['Pending', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
            default: 'Pending'
        },
        notes: {
            type: String,
            trim: true
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: {
            type: Date
        },
        interviewDate: {
            type: Date
        },
        source: {
            type: String,
            enum: ['Website', 'LinkedIn', 'Referral', 'Job Board', 'Other'],
            default: 'Website'
        }
    },
    { timestamps: true }
);

// Indexes for better query performance
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ status: 1 });

// Prevent duplicate applications from same email for same job
jobApplicationSchema.index({ job: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
