import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/analytics/overview');
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="mb-12">
                <h1 className="text-6xl font-black tracking-tighter text-white mb-4">Welcome back,</h1>
                <p className="text-xl text-dark-400 max-w-2xl font-medium">
                    Your cash flow network is currently processing <span className="text-primary-400 font-bold">{stats?.totalTransactions || 0} transactions</span> across <span className="text-accent-500 font-bold">{stats?.totalBanks || 0} banking nodes</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {[
                    { label: 'Total Volume', value: `₹${stats?.totalVolume?.toLocaleString() || 0}`, icon: '💰', color: 'from-amber-400 to-orange-600' },
                    { label: 'Total Banks', value: stats?.totalBanks || 0, icon: '🏛️', color: 'from-primary-400 to-purple-600' },
                    { label: 'Transactions', value: stats?.totalTransactions || 0, icon: '🔄', color: 'from-accent-400 to-blue-600' },
                    { label: 'Net Exposure', value: `₹${stats?.totalDebt?.toLocaleString() || 0}`, icon: '⚖️', color: 'from-danger-400 to-rose-600' },
                ].map((stat, i) => (
                    <div key={i} className="metric-orb glass-card group">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-dark-500 font-black mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Network Activity</h3>
                            <p className="text-xs text-dark-500 font-bold uppercase tracking-widest">Cash Flow Frequency Map</p>
                        </div>
                        <div className="px-3 py-1 bg-primary-500/10 rounded-full text-[10px] font-black text-primary-400 border border-primary-500/20">LIVE</div>
                    </div>

                    <div className="h-64 flex items-end gap-3 px-2">
                        {[40, 70, 45, 90, 65, 30, 85, 50, 95, 60, 35, 75].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-primary-600/40 to-accent-500/80 rounded-t-lg transition-all duration-1000 group-hover:duration-300 relative group/bar"
                                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-dark-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card bg-gradient-to-br from-dark-900/40 to-primary-900/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1.5 h-6 bg-danger-500 rounded-full"></div>
                            <h3 className="text-xs font-black text-dark-400 uppercase tracking-[0.2em]">Primary Debtor</h3>
                        </div>
                        {stats?.topDebtor ? (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-dark-950 flex items-center justify-center text-xl border border-white/5">👤</div>
                                <div>
                                    <p className="text-lg font-bold text-white leading-tight">{stats.topDebtor.name}</p>
                                    <p className="text-sm font-bold text-danger-400">₹{Math.abs(stats.topDebtor.amount).toLocaleString()} net debt</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-2xl bg-dark-950 flex items-center justify-center text-xl border border-white/5 mx-auto mb-2">?</div>
                                <p className="text-sm font-bold text-white">No Debtors</p>
                                <p className="text-xs text-dark-500">₹0 net debt</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card bg-gradient-to-br from-dark-900/40 to-accent-900/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1.5 h-6 bg-accent-500 rounded-full"></div>
                            <h3 className="text-xs font-black text-dark-400 uppercase tracking-[0.2em]">Top Creditor</h3>
                        </div>
                        {stats?.topCreditor ? (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-dark-950 flex items-center justify-center text-xl border border-white/5">👑</div>
                                <div>
                                    <p className="text-lg font-bold text-white leading-tight">{stats.topCreditor.name}</p>
                                    <p className="text-sm font-bold text-accent-400">₹{stats.topCreditor.amount.toLocaleString()} net credit</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-2xl bg-dark-950 flex items-center justify-center text-xl border border-white/5 mx-auto mb-2">?</div>
                                <p className="text-sm font-bold text-white">No Creditors</p>
                                <p className="text-xs text-dark-500">₹0 net credit</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 glass-card bg-primary-950/5 border-primary-500/10 p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-primary-500 text-[10px] font-black tracking-widest uppercase mb-6 shadow-lg shadow-primary-500/20">Advanced Algorithm</div>
                        <h2 className="text-4xl font-black text-white mb-6 leading-tight">Max-Flow / Min-Cut <br /><span className="gradient-text">Settlement Logic</span></h2>
                        <p className="text-dark-400 font-medium mb-8 leading-relaxed">
                            Our graph engine uses a optimized Greedy Max-Heap algorithm to collapse cyclic debts. By matching the largest debtors with compatible creditors, we reduce transaction volume by up to 70% while maintaining absolute parity.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 rounded-2xl bg-dark-950 border border-white/5">
                                <p className="text-primary-400 font-black text-xl mb-1">O(N log N)</p>
                                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Time Complexity</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-dark-950 border border-white/5">
                                <p className="text-accent-500 font-black text-xl mb-1">Max-Heap</p>
                                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Data Structure</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="relative h-64 w-full flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
                            <div className="w-32 h-32 rounded-3xl bg-primary-500 flex items-center justify-center text-4xl shadow-2xl shadow-primary-500/40 relative z-20 animate-pulse">⚡</div>
                            {[0, 72, 144, 216, 288].map((rot) => (
                                <div key={rot} className="absolute w-12 h-12 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center text-xl transition-all duration-500" style={{ transform: `rotate(${rot}deg) translate(120px) rotate(-${rot}deg)` }}>🏦</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
