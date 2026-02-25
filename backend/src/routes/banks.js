const express = require('express');
const Bank = require('../models/Bank');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(auth);

// Fetch banks
router.get('/', async (req, res) => {
    try {
        const banks = await Bank.find({ user: req.userId });
        res.json(banks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New Bank
router.post('/', async (req, res) => {
    try {
        const { name, paymentTypes } = req.body;
        const bank = new Bank({ name, paymentTypes, user: req.userId });
        await bank.save();
        res.status(201).json(bank);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const bank = await Bank.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!bank) return res.status(404).json({ error: 'Bank not found' });

        // Also delete associated transactions
        await Transaction.deleteMany({
            $or: [{ debtor: bank._id }, { creditor: bank._id }],
            user: req.userId
        });

        res.json({ message: 'Bank and associated transactions deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
