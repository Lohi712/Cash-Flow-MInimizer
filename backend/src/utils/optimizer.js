/**
 * Cash Flow Optimizer — Fixed & Optimized Algorithm
 *
 * Uses a greedy approach with max-heap to minimize the number of transactions
 * needed to settle all debts. Also considers payment-type matching between banks.
 */

class MaxHeap {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this._heapifyUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        return root;
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    size() {
        return this.heap.length;
    }

    _heapifyUp(index) {
        let parent = Math.floor((index - 1) / 2);
        while (index > 0 && this.heap[index].amount > this.heap[parent].amount) {
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            index = parent;
            parent = Math.floor((index - 1) / 2);
        }
    }

    _heapifyDown(index) {
        const size = this.heap.length;
        let largest = index;
        const left = 2 * index + 1;
        const right = 2 * index + 2;

        if (left < size && this.heap[left].amount > this.heap[largest].amount) {
            largest = left;
        }
        if (right < size && this.heap[right].amount > this.heap[largest].amount) {
            largest = right;
        }
        if (largest !== index) {
            [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
            this._heapifyDown(largest);
        }
    }
}

function hasCommonPaymentType(bankA, bankB) {
    return bankA.paymentTypes.some((type) => bankB.paymentTypes.includes(type));
}

function optimizeCashFlow(banks, transactions) {
    const netAmounts = {};
    const bankMap = {};

    for (const bank of banks) {
        const id = bank._id.toString();
        netAmounts[id] = 0;
        bankMap[id] = bank;
    }

    for (const tx of transactions) {
        const debtorId = tx.debtor._id ? tx.debtor._id.toString() : tx.debtor.toString();
        const creditorId = tx.creditor._id ? tx.creditor._id.toString() : tx.creditor.toString();
        netAmounts[debtorId] = (netAmounts[debtorId] || 0) - tx.amount;
        netAmounts[creditorId] = (netAmounts[creditorId] || 0) + tx.amount;
    }

    const debtorHeap = new MaxHeap();
    const creditorHeap = new MaxHeap();

    for (const [bankId, net] of Object.entries(netAmounts)) {
        if (net < 0) {
            debtorHeap.push({ amount: Math.abs(net), bankId });
        } else if (net > 0) {
            creditorHeap.push({ amount: net, bankId });
        }
    }

    const optimizedTransactions = [];

    while (debtorHeap.size() > 0 && creditorHeap.size() > 0) {
        const debtor = debtorHeap.pop();

        let creditor = null;
        const skippedCreditors = [];

        while (creditorHeap.size() > 0) {
            const candidate = creditorHeap.pop();
            const debtorBank = bankMap[debtor.bankId];
            const creditorBank = bankMap[candidate.bankId];

            if (hasCommonPaymentType(debtorBank, creditorBank)) {
                creditor = candidate;
                break;
            } else {
                skippedCreditors.push(candidate);
            }
        }

        for (const skipped of skippedCreditors) {
            creditorHeap.push(skipped);
        }

        if (!creditor) continue;

        const settleAmount = Math.min(debtor.amount, creditor.amount);

        optimizedTransactions.push({
            from: bankMap[debtor.bankId].name,
            fromId: debtor.bankId,
            to: bankMap[creditor.bankId].name,
            toId: creditor.bankId,
            amount: Math.round(settleAmount * 100) / 100,
        });

        const debtorRemaining = debtor.amount - settleAmount;
        const creditorRemaining = creditor.amount - settleAmount;

        if (debtorRemaining > 0.01) {
            debtorHeap.push({ amount: debtorRemaining, bankId: debtor.bankId });
        }
        if (creditorRemaining > 0.01) {
            creditorHeap.push({ amount: creditorRemaining, bankId: creditor.bankId });
        }
    }

    const netAmountsSummary = Object.entries(netAmounts).map(([bankId, net]) => ({
        bankId,
        bankName: bankMap[bankId] ? bankMap[bankId].name : 'Unknown',
        netAmount: Math.round(net * 100) / 100,
    }));

    return {
        originalCount: transactions.length,
        optimizedCount: optimizedTransactions.length,
        savings: transactions.length - optimizedTransactions.length,
        optimizedTransactions,
        netAmounts: netAmountsSummary,
    };
}

module.exports = { optimizeCashFlow, MaxHeap };
