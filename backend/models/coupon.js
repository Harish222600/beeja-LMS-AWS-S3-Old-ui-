const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'flat']
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(value) {
                // For percentage discounts, value should not exceed 100
                if (this.discountType === 'percentage') {
                    return value <= 100;
                }
                return true;
            },
            message: 'Percentage discount cannot exceed 100%'
        }
    },
    maxDiscountAmount: {
        type: Number,
        default: 0, // 0 means no maximum limit
        min: 0
    },
    usageLimit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    minimumOrderAmount: {
        type: Number,
        default: 0
    },
    linkedTo: {
        type: String,
        required: true,
        enum: ['course', 'bundle'],
        default: 'course'
    },
    showOnFront: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0, // Higher number = higher priority for display
        min: 0
    },
    isCombinable: {
        type: Boolean,
        default: false // Whether this coupon can be combined with others
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    startDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userUsage: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedCount: {
            type: Number,
            default: 1
        }
    }],
    analytics: {
        timesViewed: {
            type: Number,
            default: 0
        },
        timesValidated: {
            type: Number,
            default: 0
        },
        successfulUses: {
            type: Number,
            default: 0
        },
        failedAttempts: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date
    }
});

// Add index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, expiryDate: 1 });
couponSchema.index({ linkedTo: 1 });
couponSchema.index({ showOnFront: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
