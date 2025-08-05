const mongoose = require('mongoose');

const adminSectionViewsSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sectionViews: {
        reviews: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        accessRequests: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        bundleRequests: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        careers: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        notifications: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        contactMessages: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        faqs: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        },
        chats: {
            lastSeenAt: {
                type: Date,
                default: null
            }
        }
    }
}, {
    timestamps: true
});

// Ensure one record per admin
adminSectionViewsSchema.index({ adminId: 1 }, { unique: true });

module.exports = mongoose.model('AdminSectionViews', adminSectionViewsSchema);
