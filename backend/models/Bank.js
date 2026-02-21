const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true,
    },
    paymentTypes: {
        type: [String],
        required: [true, 'At least one payment type is required'],
        validate: {
            validator: (v) => v.length > 0,
            message: 'A bank must have at least one payment type',
        },
    },
    netAmount: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// Ensure bank name is unique per user
bankSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Bank', bankSchema);
