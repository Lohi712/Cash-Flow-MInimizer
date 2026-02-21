const express = require('express');
const Transaction = require('../models/Transaction');
const Bank = require('../models/Bank');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const { bankId, minAmount, maxAmount } = req.query;
        let query = { user: req.userId };

        if (bankId) {
            query.$or = [{ debtor: bankId }, { creditor: bankId }];
        }
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseFloat(minAmount);
            if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        const transactions = await Transaction.find(query)
            .populate('debtor', 'name')
            .populate('creditor', 'name')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/transactions
router.post('/', async (req, res) => {
    try {
        const { debtor, creditor, amount } = req.body;

        // Validate banks exist and belong to user
        const banks = await Bank.find({
            _id: { $in: [debtor, creditor] },
            user: req.userId
        });
        if (banks.length !== 2) {
            return res.status(400).json({ error: 'One or both banks not found' });
        }

        const tx = new Transaction({ debtor, creditor, amount, user: req.userId });
        await tx.save();

        // Update bank net amounts
        await Bank.findByIdAndUpdate(debtor, { $inc: { netAmount: -amount } });
        await Bank.findByIdAndUpdate(creditor, { $inc: { netAmount: amount } });

        const populatedTx = await tx.populate('debtor creditor', 'name');
        res.status(201).json(populatedTx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    try {
        const tx = await Transaction.findOne({ _id: req.params.id, user: req.userId });
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });

        // Reverse bank net amounts before deleting
        await Bank.findByIdAndUpdate(tx.debtor, { $inc: { netAmount: tx.amount } });
        await Bank.findByIdAndUpdate(tx.creditor, { $inc: { netAmount: -tx.amount } });

        await tx.deleteOne();
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
