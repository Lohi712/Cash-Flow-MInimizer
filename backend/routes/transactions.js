const express = require('express');
const Transaction = require('../models/Transaction');
const Bank = require('../models/Bank');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/transactions — List all transactions (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { bankId, startDate, endDate, minAmount, maxAmount } = req.query;
        const filter = { user: req.userId };

        if (bankId) {
            filter.$or = [{ debtor: bankId }, { creditor: bankId }];
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = parseFloat(minAmount);
            if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
        }

        const transactions = await Transaction.find(filter)
            .populate('debtor', 'name paymentTypes')
            .populate('creditor', 'name paymentTypes')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/transactions — Add a transaction
router.post('/', async (req, res) => {
    try {
        const { debtor, creditor, amount } = req.body;

        if (!debtor || !creditor || !amount) {
            return res.status(400).json({ error: 'Debtor, creditor, and amount are required.' });
        }

        if (debtor === creditor) {
            return res.status(400).json({ error: 'Debtor and creditor cannot be the same bank.' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0.' });
        }

        // Verify both banks exist and belong to user
        const [debtorBank, creditorBank] = await Promise.all([
            Bank.findOne({ _id: debtor, user: req.userId }),
            Bank.findOne({ _id: creditor, user: req.userId }),
        ]);

        if (!debtorBank || !creditorBank) {
            return res.status(404).json({ error: 'One or both banks not found.' });
        }

        const transaction = await Transaction.create({
            debtor,
            creditor,
            amount,
            user: req.userId,
        });

        // Update net amounts
        await Bank.findByIdAndUpdate(debtor, { $inc: { netAmount: -amount } });
        await Bank.findByIdAndUpdate(creditor, { $inc: { netAmount: amount } });

        const populated = await Transaction.findById(transaction._id)
            .populate('debtor', 'name paymentTypes')
            .populate('creditor', 'name paymentTypes');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/transactions/:id — Delete a transaction
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.userId,
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }

        // Reverse net amounts
        await Bank.findByIdAndUpdate(transaction.debtor, { $inc: { netAmount: transaction.amount } });
        await Bank.findByIdAndUpdate(transaction.creditor, { $inc: { netAmount: -transaction.amount } });

        res.json({ message: 'Transaction deleted and balances reversed.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
