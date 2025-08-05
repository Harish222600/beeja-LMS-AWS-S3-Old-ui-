const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponUsed: {
        code: {
            type: String,
            default: null
        },
        discountType: {
            type: String,
            enum: {
                values: ['percentage', 'flat'],
                message: 'discountType must be either percentage or flat'
            },
            required: false,
            default: undefined
        },
        discountValue: {
            type: Number,
            default: 0
        },
        discountAmount: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: Boolean,
        default: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
