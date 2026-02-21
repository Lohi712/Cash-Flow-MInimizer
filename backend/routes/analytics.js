const express = require('express');
const Bank = require('../models/Bank');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/analytics/overview — Dashboard analytics
router.get('/overview', async (req, res) => {
    try {
        const banks = await Bank.find({ user: req.userId });
        const transactions = await Transaction.find({ user: req.userId })
            .populate('debtor', 'name')
            .populate('creditor', 'name');

        const totalDebt = banks.reduce((sum, b) => sum + (b.netAmount < 0 ? Math.abs(b.netAmount) : 0), 0);
        const totalCredit = banks.reduce((sum, b) => sum + (b.netAmount > 0 ? b.netAmount : 0), 0);
        const totalTransactions = transactions.length;
        const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Most active bank
        const bankActivity = {};
        for (const tx of transactions) {
            const dName = tx.debtor?.name || 'Unknown';
            const cName = tx.creditor?.name || 'Unknown';
            bankActivity[dName] = (bankActivity[dName] || 0) + 1;
            bankActivity[cName] = (bankActivity[cName] || 0) + 1;
        }

        let mostActiveBank = null;
        let maxActivity = 0;
        for (const [name, count] of Object.entries(bankActivity)) {
            if (count > maxActivity) {
                maxActivity = count;
                mostActiveBank = name;
            }
        }

        // Top debtor and creditor
        const topDebtor = banks.reduce((min, b) => (b.netAmount < (min?.netAmount ?? 0) ? b : min), banks[0]);
        const topCreditor = banks.reduce((max, b) => (b.netAmount > (max?.netAmount ?? 0) ? b : max), banks[0]);

        res.json({
            totalBanks: banks.length,
            totalTransactions,
            totalVolume: Math.round(totalVolume * 100) / 100,
            totalDebt: Math.round(totalDebt * 100) / 100,
            totalCredit: Math.round(totalCredit * 100) / 100,
            mostActiveBank: mostActiveBank ? { name: mostActiveBank, count: maxActivity } : null,
            topDebtor: topDebtor ? { name: topDebtor.name, amount: topDebtor.netAmount } : null,
            topCreditor: topCreditor ? { name: topCreditor.name, amount: topCreditor.netAmount } : null,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/analytics/prediction/:bankId — Cash flow prediction
router.get('/prediction/:bankId', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const bank = await Bank.findOne({ _id: req.params.bankId, user: req.userId });
        if (!bank) {
            return res.status(404).json({ error: 'Bank not found.' });
        }

        const transactions = await Transaction.find({
            $or: [{ debtor: bank._id }, { creditor: bank._id }],
            user: req.userId,
        }).sort({ createdAt: 1 });

        if (transactions.length === 0) {
            return res.json({
                bankName: bank.name,
                days: parseInt(days),
                predictedIncoming: 0,
                predictedOutgoing: 0,
                netPredicted: 0,
                message: 'No transaction data available for prediction.',
            });
        }

        const incoming = transactions.filter((t) => t.creditor.toString() === bank._id.toString());
        const outgoing = transactions.filter((t) => t.debtor.toString() === bank._id.toString());

        const avgIncoming = incoming.length > 0
            ? incoming.reduce((sum, t) => sum + t.amount, 0) / incoming.length
            : 0;
        const avgOutgoing = outgoing.length > 0
            ? outgoing.reduce((sum, t) => sum + t.amount, 0) / outgoing.length
            : 0;

        const firstDate = transactions[0].createdAt;
        const lastDate = transactions[transactions.length - 1].createdAt;
        const timeRangeDays = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24) + 1);

        const incomingFreq = incoming.length / timeRangeDays;
        const outgoingFreq = outgoing.length / timeRangeDays;

        const numDays = parseInt(days);
        const predictedIncoming = avgIncoming * incomingFreq * numDays;
        const predictedOutgoing = avgOutgoing * outgoingFreq * numDays;

        res.json({
            bankName: bank.name,
            days: numDays,
            predictedIncoming: Math.round(predictedIncoming * 100) / 100,
            predictedOutgoing: Math.round(predictedOutgoing * 100) / 100,
            netPredicted: Math.round((predictedIncoming - predictedOutgoing) * 100) / 100,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/analytics/summary — Monthly summary
router.get('/summary', async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required.' });
        }

        const m = parseInt(month);
        const y = parseInt(year);
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        const banks = await Bank.find({ user: req.userId });
        const transactions = await Transaction.find({
            user: req.userId,
            createdAt: { $gte: startDate, $lte: endDate },
        }).populate('debtor', 'name').populate('creditor', 'name');

        const summary = banks.map((bank) => {
            const incoming = transactions
                .filter((t) => t.creditor._id.toString() === bank._id.toString())
                .reduce((sum, t) => sum + t.amount, 0);
            const outgoing = transactions
                .filter((t) => t.debtor._id.toString() === bank._id.toString())
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                bankName: bank.name,
                bankId: bank._id,
                incoming: Math.round(incoming * 100) / 100,
                outgoing: Math.round(outgoing * 100) / 100,
                net: Math.round((incoming - outgoing) * 100) / 100,
            };
        });

        res.json({
            month: m,
            year: y,
            totalTransactions: transactions.length,
            summary,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
