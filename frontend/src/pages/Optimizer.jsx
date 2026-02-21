import { useState } from 'react';
import { optimizeAPI } from '../services/api';

export default function Optimizer() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const runOptimizer = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const { data } = await optimizeAPI.run();
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to optimize');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text">Cash Flow Optimizer</h1>
                <p className="text-dark-400 mt-1">Minimize the number of transactions using greedy algorithm</p>
            </div>

            {/* Run Button */}
            <div className="glass-card text-center mb-8">
                <div className="mb-4">
                    <p className="text-5xl mb-3">⚡</p>
                    <p className="text-dark-300 max-w-md mx-auto text-sm">
                        The optimizer uses a <span className="text-primary-400 font-medium">Max Heap</span> based
                        greedy algorithm to settle all debts with the minimum number of transactions,
                        while respecting payment type compatibility.
                    </p>
                </div>
                <button
                    onClick={runOptimizer}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-500 hover:to-accent-400 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-50 text-lg"
                >
                    {loading ? '⏳ Optimizing...' : '🚀 Run Optimizer'}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400">
                    {error}
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="animate-fade-in space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="glass-card text-center">
                            <p className="text-sm text-dark-400 mb-1">Original Transactions</p>
                            <p className="text-3xl font-bold text-danger-400">{result.originalCount}</p>
                        </div>
                        <div className="glass-card text-center">
                            <p className="text-sm text-dark-400 mb-1">Optimized Transactions</p>
                            <p className="text-3xl font-bold text-accent-400">{result.optimizedCount}</p>
                        </div>
                        <div className="glass-card text-center">
                            <p className="text-sm text-dark-400 mb-1">Transactions Saved</p>
                            <p className="text-3xl font-bold text-primary-400">{result.savings}</p>
                            {result.originalCount > 0 && (
                                <p className="text-xs text-dark-500 mt-1">
                                    {((result.savings / result.originalCount) * 100).toFixed(0)}% reduction
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Optimized Transactions */}
                    <div className="glass-card">
                        <h3 className="text-lg font-bold text-primary-300 mb-4">Optimized Settlement Plan</h3>
                        {result.optimizedTransactions.length === 0 ? (
                            <p className="text-dark-500">All balances are already settled!</p>
                        ) : (
                            <div className="space-y-3">
                                {result.optimizedTransactions.map((tx, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-dark-800/40 rounded-xl animate-slide-in"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="px-3 py-1 bg-danger-500/10 text-danger-400 rounded-lg text-sm font-medium">
                                                {tx.from}
                                            </span>
                                            <div className="flex items-center gap-1 text-dark-500">
                                                <span>→</span>
                                                <span className="text-xs">pays</span>
                                                <span>→</span>
                                            </div>
                                            <span className="px-3 py-1 bg-accent-500/10 text-accent-400 rounded-lg text-sm font-medium">
                                                {tx.to}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-white">₹{tx.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Net Amounts */}
                    <div className="glass-card">
                        <h3 className="text-lg font-bold text-primary-300 mb-4">Net Amounts per Bank</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {result.netAmounts.map(({ bankName, netAmount }) => (
                                <div key={bankName} className="flex items-center justify-between p-3 bg-dark-800/40 rounded-xl">
                                    <span className="text-sm font-medium text-dark-200">{bankName}</span>
                                    <span className={`text-sm font-bold ${netAmount > 0 ? 'text-accent-400' : netAmount < 0 ? 'text-danger-400' : 'text-dark-500'
                                        }`}>
                                        {netAmount > 0 ? '+' : ''}₹{netAmount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
