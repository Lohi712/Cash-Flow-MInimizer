import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ debtor: '', creditor: '', amount: '' });
    const [filters, setFilters] = useState({ bankId: '', minAmount: '', maxAmount: '' });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const [txRes, bankRes] = await Promise.all([
                api.get('/transactions', { params: filters }),
                api.get('/banks')
            ]);
            setTransactions(txRes.data);
            setBanks(bankRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTx = async (e) => {
        e.preventDefault();
        if (formData.debtor === formData.creditor) return alert('Debtor and Creditor cannot be the same bank');
        try {
            await api.post('/transactions', formData);
            setFormData({ debtor: '', creditor: '', amount: '' });
            setIsAdding(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Execution failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && transactions.length === 0) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Transactions</h1>
                    <p className="text-dark-400 font-medium">Keep track of every transfer between your banks.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-xl ${isAdding ? 'bg-dark-900 text-white border border-white/10' : 'bg-accent-500 hover:bg-accent-400 text-dark-950 shadow-accent-500/20'}`}
                >
                    {isAdding ? 'Cancel' : 'New Transfer'}
                    <span className="text-xl">{isAdding ? '✖' : '💸'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="glass-card mb-12 border-accent-500/20 relative overflow-hidden animate-slide-down">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 to-primary-500"></div>
                    <form onSubmit={handleAddTx} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="block text-xs font-semibold text-dark-400 mb-3">From (who's paying)</label>
                            <select
                                required
                                className="w-full px-6 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all font-bold appearance-none cursor-pointer"
                                value={formData.debtor}
                                onChange={(e) => setFormData({ ...formData, debtor: e.target.value })}
                            >
                                <option value="" className="bg-dark-900">Select Bank</option>
                                {banks.map(b => <option key={b._id} value={b._id} className="bg-dark-900">{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-dark-400 mb-3">To (who's receiving)</label>
                            <select
                                required
                                className="w-full px-6 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all font-bold appearance-none cursor-pointer"
                                value={formData.creditor}
                                onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                            >
                                <option value="" className="bg-dark-900">Select Bank</option>
                                {banks.map(b => <option key={b._id} value={b._id} className="bg-dark-900">{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-dark-400 mb-3">Amount</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-dark-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all font-bold"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3 flex justify-end pt-4 border-t border-white/5">
                            <button type="submit" className="px-10 py-4 bg-accent-500 hover:bg-accent-400 text-dark-950 font-bold rounded-2xl shadow-xl shadow-accent-500/30 transition-all active:scale-95">
                                Send Transfer →
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card mb-8 p-4 md:flex flex-wrap items-center gap-6 border-white/5">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-semibold text-dark-400 mb-1.5 ml-1">Filter by bank</label>
                    <select
                        className="w-full bg-dark-950/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                        value={filters.bankId}
                        onChange={(e) => setFilters({ ...filters, bankId: e.target.value })}
                    >
                        <option value="">All Active Nodes</option>
                        {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-4 min-w-[300px]">
                    <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-dark-400 mb-1.5 ml-1">Min amount</label>
                        <input
                            type="number"
                            placeholder="₹ 0"
                            className="w-full bg-dark-950/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                            value={filters.minAmount}
                            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-dark-400 mb-1.5 ml-1">Max amount</label>
                        <input
                            type="number"
                            placeholder="₹ 99M"
                            className="w-full bg-dark-950/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                            value={filters.maxAmount}
                            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {transactions.length === 0 ? (
                    <div className="glass-card p-20 text-center border-dashed border-2 border-white/5">
                        <p className="text-dark-500 font-medium">No transactions found. Try adjusting your filters or add a new transfer.</p>
                    </div>
                ) : (
                    transactions.map((tx, i) => (
                        <div
                            key={tx._id}
                            className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 group hover:border-white/10 transition-all animate-staggered-fade-in relative overflow-hidden"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-400 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-center gap-8 flex-1">
                                <div className="hidden sm:flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-dark-500 font-bold">{transactions.length - i}</div>
                                    <div className="w-px h-8 bg-gradient-to-b from-white/10 to-transparent mt-2"></div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 flex-1">
                                    <div className="min-w-[120px]">
                                        <p className="text-[10px] font-medium text-dark-500 mb-1">From</p>
                                        <p className="text-lg font-black text-white truncate">{tx.debtor?.name}</p>
                                    </div>

                                    <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-white/2 border border-white/5 relative group-hover:border-primary-500/20 transition-all">
                                        <span className="text-lg animate-pulse">➡️</span>
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-dark-900 border border-white/10 px-2 py-0.5 rounded text-[8px] font-black text-primary-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">TRANSFER</div>
                                    </div>

                                    <div className="min-w-[120px]">
                                        <p className="text-[10px] font-medium text-dark-500 mb-1">To</p>
                                        <p className="text-lg font-black text-white truncate">{tx.creditor?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <div className="text-right">
                                    <p className="text-[10px] font-medium text-dark-500 mb-1">Amount</p>
                                    <p className="text-2xl font-black text-white tracking-tighter group-hover:text-accent-400 transition-colors">₹{tx.amount.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(tx._id)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-dark-950 border border-white/5 text-dark-700 hover:text-danger-400 hover:border-danger-500/20 hover:bg-danger-500/10 transition-all"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
