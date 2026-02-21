const express = require('express');
const Bank = require('../models/Bank');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/banks — List all banks for the user
router.get('/', async (req, res) => {
    try {
        const banks = await Bank.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(banks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/banks — Add a new bank
router.post('/', async (req, res) => {
    try {
        const { name, paymentTypes } = req.body;

        if (!name || !paymentTypes || paymentTypes.length === 0) {
            return res.status(400).json({ error: 'Name and at least one payment type are required.' });
        }

        const bank = await Bank.create({
            name,
            paymentTypes,
            user: req.userId,
        });

        res.status(201).json(bank);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'A bank with this name already exists.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/banks/:id — Delete a bank
router.delete('/:id', async (req, res) => {
    try {
        const bank = await Bank.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!bank) {
            return res.status(404).json({ error: 'Bank not found.' });
        }

        // Also delete all transactions involving this bank
        await Transaction.deleteMany({
            $or: [{ debtor: req.params.id }, { creditor: req.params.id }],
            user: req.userId,
        });

        res.json({ message: 'Bank and associated transactions deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
