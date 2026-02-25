const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    debtor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: [true, 'Debtor bank is required'],
    },
    creditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: [true, 'Creditor bank is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
