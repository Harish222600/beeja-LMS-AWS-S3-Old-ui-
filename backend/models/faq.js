const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        answer: {
            type: String,
            trim: true,
            default: null
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['pending', 'answered'],
            default: 'pending'
        },
        answeredAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
