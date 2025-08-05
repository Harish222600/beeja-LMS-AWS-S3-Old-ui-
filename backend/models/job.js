const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        responsibilities: {
            type: [String],
            required: true
        },
        requirements: {
            type: [String],
            required: true
        },
        applicationDeadline: {
            type: Date,
            required: true
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        employmentType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
            default: 'Full-time'
        },
        experienceLevel: {
            type: String,
            enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
            default: 'Mid Level'
        },
        salaryRange: {
            min: {
                type: Number,
                default: null
            },
            max: {
                type: Number,
                default: null
            },
            currency: {
                type: String,
                default: 'USD'
            }
        },
        benefits: {
            type: [String],
            default: []
        },
        applicationCount: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

// Index for better query performance
jobSchema.index({ isPublished: 1, applicationDeadline: 1 });
jobSchema.index({ department: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
