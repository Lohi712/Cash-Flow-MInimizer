import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTransactions, addTransaction, removeTransaction, setLoading } from '../store/transactionSlice';
import { setBanks } from '../store/bankSlice';
import { transactionsAPI, banksAPI } from '../services/api';

export default function Transactions() {
    const dispatch = useDispatch();
    const { list: transactions, loading } = useSelector((state) => state.transactions);
    const { list: banks } = useSelector((state) => state.banks);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ debtor: '', creditor: '', amount: '' });
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ bankId: '', minAmount: '', maxAmount: '' });

    useEffect(() => {
        dispatch(setLoading(true));
        Promise.all([
            transactionsAPI.getAll(),
            banksAPI.getAll(),
        ]).then(([txRes, bankRes]) => {
            dispatch(setTransactions(txRes.data));
            dispatch(setBanks(bankRes.data));
        }).catch(() => dispatch(setLoading(false)));
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await transactionsAPI.create({
                debtor: form.debtor,
                creditor: form.creditor,
                amount: parseFloat(form.amount),
            });
            dispatch(addTransaction(data));
            setForm({ debtor: '', creditor: '', amount: '' });
            setShowForm(false);
            // Refresh banks to get updated net amounts
            const bankRes = await banksAPI.getAll();
            dispatch(setBanks(bankRes.data));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add transaction');
        }
    };

    const handleDelete = async (id) => {
        try {
            await transactionsAPI.delete(id);
            dispatch(removeTransaction(id));
            const bankRes = await banksAPI.getAll();
            dispatch(setBanks(bankRes.data));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const handleFilter = async () => {
        dispatch(setLoading(true));
        try {
            const params = {};
            if (filter.bankId) params.bankId = filter.bankId;
            if (filter.minAmount) params.minAmount = filter.minAmount;
            if (filter.maxAmount) params.maxAmount = filter.maxAmount;
            const { data } = await transactionsAPI.getAll(params);
            dispatch(setTransactions(data));
        } catch { dispatch(setLoading(false)); }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Transactions</h1>
                    <p className="text-dark-400 mt-1">Manage cash flows between banks</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-600/20"
                >
                    {showForm ? 'Cancel' : '+ Add Transaction'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                    {error}
                </div>
            )}

            {/* Add Transaction Form */}
            {showForm && (
                <div className="glass-card mb-6 animate-slide-in">
                    <h3 className="text-lg font-semibold mb-4">New Transaction</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">From (Debtor)</label>
                            <select
                                value={form.debtor}
                                onChange={(e) => setForm({ ...form, debtor: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50 transition-all"
                                required
                            >
                                <option value="">Select bank</option>
                                {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">To (Creditor)</label>
                            <select
                                value={form.creditor}
                                onChange={(e) => setForm({ ...form, creditor: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50 transition-all"
                                required
                            >
                                <option value="">Select bank</option>
                                {banks.filter(b => b._id !== form.debtor).map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Amount (₹)</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50 transition-all"
                                placeholder="5000"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-3 bg-accent-500 text-white font-medium rounded-xl hover:bg-accent-600 transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="glass-card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs text-dark-400 mb-1">Filter by Bank</label>
                        <select
                            value={filter.bankId}
                            onChange={(e) => setFilter({ ...filter, bankId: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-800/60 border border-dark-600/50 rounded-lg text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                        >
                            <option value="">All Banks</option>
                            {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-dark-400 mb-1">Min Amount</label>
                        <input
                            type="number"
                            value={filter.minAmount}
                            onChange={(e) => setFilter({ ...filter, minAmount: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-800/60 border border-dark-600/50 rounded-lg text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-dark-400 mb-1">Max Amount</label>
                        <input
                            type="number"
                            value={filter.maxAmount}
                            onChange={(e) => setFilter({ ...filter, maxAmount: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-800/60 border border-dark-600/50 rounded-lg text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                            placeholder="100000"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="px-4 py-2 bg-dark-700 text-dark-200 rounded-lg hover:bg-dark-600 transition-all text-sm font-medium"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Transaction List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="glass-card h-16 animate-pulse" />)}
                </div>
            ) : transactions.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <p className="text-4xl mb-3">💸</p>
                    <p className="text-dark-400">No transactions yet. Add a transaction to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx, i) => (
                        <div key={tx._id} className="glass-card flex items-center justify-between py-4 animate-slide-in"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-danger-500/15 flex items-center justify-center text-danger-400 text-sm font-bold">
                                    {tx.debtor?.name?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="text-sm">
                                        <span className="font-semibold text-danger-400">{tx.debtor?.name || 'Unknown'}</span>
                                        <span className="text-dark-500 mx-2">→</span>
                                        <span className="font-semibold text-accent-400">{tx.creditor?.name || 'Unknown'}</span>
                                    </p>
                                    <p className="text-xs text-dark-500">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-white">₹{tx.amount.toLocaleString()}</span>
                                <button
                                    onClick={() => handleDelete(tx._id)}
                                    className="text-dark-500 hover:text-danger-400 transition-colors"
                                    title="Delete"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
