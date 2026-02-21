import { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';

export default function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyticsAPI.getOverview()
            .then(res => setOverview(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingState />;

    const stats = [
        { label: 'Total Banks', value: overview?.totalBanks || 0, icon: '🏦', color: 'from-primary-500 to-primary-700' },
        { label: 'Transactions', value: overview?.totalTransactions || 0, icon: '💸', color: 'from-accent-500 to-accent-600' },
        { label: 'Total Volume', value: `₹${(overview?.totalVolume || 0).toLocaleString()}`, icon: '💰', color: 'from-yellow-500 to-orange-500' },
        { label: 'Total Debt', value: `₹${(overview?.totalDebt || 0).toLocaleString()}`, icon: '📉', color: 'from-danger-400 to-danger-500' },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                <p className="text-dark-400 mt-1">Overview of your cash flow network</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map(({ label, value, icon, color }) => (
                    <div key={label} className="glass-card group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{icon}</span>
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${color}`} />
                        </div>
                        <p className="text-2xl font-bold text-white">{value}</p>
                        <p className="text-sm text-dark-400 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Most Active Bank */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                        Most Active Bank
                    </h3>
                    {overview?.mostActiveBank ? (
                        <div>
                            <p className="text-xl font-bold text-primary-300">{overview.mostActiveBank.name}</p>
                            <p className="text-sm text-dark-400">{overview.mostActiveBank.count} transactions</p>
                        </div>
                    ) : (
                        <p className="text-dark-500">No data yet</p>
                    )}
                </div>

                {/* Top Debtor */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                        Top Debtor
                    </h3>
                    {overview?.topDebtor ? (
                        <div>
                            <p className="text-xl font-bold text-danger-400">{overview.topDebtor.name}</p>
                            <p className="text-sm text-dark-400">
                                Owes ₹{Math.abs(overview.topDebtor.amount).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-dark-500">No data yet</p>
                    )}
                </div>

                {/* Top Creditor */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                        Top Creditor
                    </h3>
                    {overview?.topCreditor ? (
                        <div>
                            <p className="text-xl font-bold text-accent-400">{overview.topCreditor.name}</p>
                            <p className="text-sm text-dark-400">
                                Owed ₹{overview.topCreditor.amount.toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-dark-500">No data yet</p>
                    )}
                </div>
            </div>

            {/* DSA Info */}
            <div className="glass-card mt-8">
                <h3 className="text-lg font-bold text-primary-300 mb-3">💡 About the Algorithm</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-dark-300">
                    <div className="bg-dark-800/40 rounded-xl p-4">
                        <p className="font-semibold text-primary-400 mb-1">Max Heap</p>
                        <p>Greedily matches the largest debtor with the largest compatible creditor for optimal settling.</p>
                    </div>
                    <div className="bg-dark-800/40 rounded-xl p-4">
                        <p className="font-semibold text-accent-400 mb-1">Graph Theory</p>
                        <p>Models cash flows as a directed weighted graph between banks.</p>
                    </div>
                    <div className="bg-dark-800/40 rounded-xl p-4">
                        <p className="font-semibold text-yellow-400 mb-1">Greedy Algorithm</p>
                        <p>Minimizes the number of transactions needed to settle all debts.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="animate-fade-in">
            <div className="h-8 w-48 bg-dark-800 rounded-lg mb-8 animate-pulse" />
            <div className="grid grid-cols-4 gap-5 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card h-24 animate-pulse"><div className="h-6 w-20 bg-dark-700 rounded" /></div>
                ))}
            </div>
        </div>
    );
}
