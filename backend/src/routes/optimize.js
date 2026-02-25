const express = require('express');
const Bank = require('../models/Bank');
const Transaction = require('../models/Transaction');
const { optimizeCashFlow } = require('../utils/optimizer');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Run cash flow minimization
router.post('/', async (req, res) => {
    try {
        const banks = await Bank.find({ user: req.userId });
        const transactions = await Transaction.find({ user: req.userId })
            .populate('debtor', 'name paymentTypes')
            .populate('creditor', 'name paymentTypes');

        if (banks.length < 2) {
            return res.status(400).json({ error: 'Need at least 2 banks to optimize.' });
        }

        if (transactions.length === 0) {
            return res.status(400).json({ error: 'No transactions to optimize.' });
        }

        const result = optimizeCashFlow(banks, transactions);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
