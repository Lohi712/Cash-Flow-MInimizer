import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Optimizer() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleOptimize = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/optimize');
            setResult(data);
        } catch (err) {
            alert(err.response?.data?.error || 'Optimization failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            <div className="glass-card bg-gradient-to-br from-dark-900/60 to-primary-900/10 p-12 mb-12 border-primary-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full border border-primary-500/20 text-[10px] font-black text-primary-400 uppercase tracking-widest mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span>
                        Ready to optimize
                    </div>

                    <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                        Simplify your <span className="gradient-text">payments</span>
                    </h1>
                    <p className="text-lg text-dark-400 max-w-2xl font-medium mb-10 leading-relaxed">
                        We’ll look at all your transactions and figure out the fewest transfers needed to settle everyone up. Less hassle, same result.
                    </p>

                    <button
                        onClick={handleOptimize}
                        disabled={loading}
                        className="group relative px-12 py-6 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-3xl shadow-2xl shadow-primary-600/30 active:scale-95 transition-all text-xl disabled:opacity-50 disabled:active:scale-100"
                    >
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl bg-primary-400/50 -z-10"></div>
                        {loading ? (
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                            <span>Working on it...</span>
                        </div>
                        ) : (
                        <div className="flex items-center gap-4">
                                <span>Optimize Now</span>
                                <span className="text-2xl">✨</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {result && (
                <div className="animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        <div className="metric-orb glass-card">
                            <p className="text-xs font-medium text-dark-500 mb-2">Before</p>
                            <p className="text-4xl font-black text-white tracking-tighter">{result.originalCount}</p>
                            <div className="mt-4 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-medium text-dark-400">Original</div>
                        </div>
                        <div className="metric-orb glass-card border-accent-500/20 bg-accent-500/5">
                            <p className="text-xs font-medium text-accent-500 mb-2">After</p>
                            <p className="text-4xl font-black text-white tracking-tighter">{result.optimizedCount}</p>
                            <div className="mt-4 px-3 py-1 bg-accent-500/20 rounded-lg text-[10px] font-medium text-accent-400">Optimized</div>
                        </div>
                        <div className="metric-orb glass-card border-primary-500/20 bg-primary-500/5">
                            <p className="text-xs font-medium text-primary-400 mb-2">Saved</p>
                            <p className="text-4xl font-black text-white tracking-tighter">
                                {Math.round((1 - result.optimizedCount / (result.originalCount || 1)) * 100)}%
                            </p>
                            <div className="mt-4 px-3 py-1 bg-primary-500/20 rounded-lg text-[10px] font-medium text-primary-400">Reduction</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Simplified Transfers</h3>
                                    <p className="text-xs text-dark-500 font-medium">Here’s how to settle up with fewer payments</p>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-dark-950 flex items-center justify-center text-xl">📜</div>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                {result.settlements.map((s, i) => (
                                    <div
                                        key={i}
                                        className="p-5 rounded-2xl bg-dark-950 border border-white/5 flex items-center justify-between gap-4 group hover:border-accent-500/20 transition-all animate-staggered-fade-in"
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="text-sm font-bold text-dark-400 truncate">{s.from}</div>
                                            <div className="text-lg text-dark-700 animate-pulse">➡️</div>
                                            <div className="text-sm font-bold text-white truncate">{s.to}</div>
                                        </div>
                                        <div className="text-lg font-black text-accent-400">₹{s.amount.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Final Balances</h3>
                                    <p className="text-xs text-dark-500 font-medium">Where each bank stands after settling</p>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-dark-950 flex items-center justify-center text-xl">⚖️</div>
                            </div>

                            <div className="space-y-4">
                                {result.finalStates.map((fs, i) => (
                                    <div
                                        key={i}
                                        className="p-5 rounded-2xl bg-dark-950 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-8 rounded-full ${fs.amount >= 0 ? 'bg-accent-500' : 'bg-danger-500'}`}></div>
                                            <p className="font-bold text-white">{fs.bank}</p>
                                        </div>
                                        <p className={`font-black text-lg ${fs.amount >= 0 ? 'text-accent-400' : 'text-danger-400'}`}>
                                            {fs.amount >= 0 ? '+' : '-'}₹{Math.abs(fs.amount).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
