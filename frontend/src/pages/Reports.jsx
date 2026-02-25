import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('summary');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [summaryData, setSummaryData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState('');
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBanks();
        if (activeTab === 'summary') fetchSummary();
    }, [activeTab, month, year]);

    const fetchBanks = async () => {
        try {
            const { data } = await api.get('/banks');
            setBanks(data);
            if (data.length > 0 && !selectedBank) setSelectedBank(data[0]._id);
        } catch (err) { console.error(err); }
    };

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/analytics/summary', { params: { month, year } });
            setSummaryData(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPrediction = async () => {
        if (!selectedBank) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/analytics/prediction/${selectedBank}`, { params: { days } });
            setPredictionData(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="animate-fade-in pb-20">
            <div className="mb-12">
                <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Reports</h1>
                <p className="text-dark-400 font-medium">See how your money has been flowing and where it’s headed.</p>
            </div>

            <div className="flex p-1.5 bg-dark-900/60 backdrop-blur-md rounded-[2rem] border border-white/5 w-fit mb-12 shadow-2xl">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-10 py-3 rounded-full text-xs font-bold tracking-wide transition-all ${activeTab === 'summary' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 nebula-border-glow' : 'text-dark-500 hover:text-dark-300'}`}
                >
                    Monthly View
                </button>
                <button
                    onClick={() => setActiveTab('prediction')}
                    className={`px-10 py-3 rounded-full text-xs font-bold tracking-wide transition-all ${activeTab === 'prediction' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 nebula-border-glow' : 'text-dark-500 hover:text-dark-300'}`}
                >
                    Forecast
                </button>
            </div>

            {activeTab === 'summary' ? (
                <div className="animate-slide-up">
                    <div className="glass-card mb-8 p-4 flex flex-wrap items-center gap-6 border-white/5">
                        <div className="flex gap-4">
                            <select
                                className="bg-dark-950/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 font-bold"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select
                                className="bg-dark-950/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 font-bold"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-8 py-6 text-xs font-semibold text-dark-400">Bank</th>
                                        <th className="px-8 py-6 text-xs font-semibold text-dark-400">Money In</th>
                                        <th className="px-8 py-6 text-xs font-semibold text-dark-400">Money Out</th>
                                        <th className="px-8 py-6 text-xs font-semibold text-dark-400">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/2">
                                    {summaryData?.summary.map((row, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-dark-950 flex items-center justify-center text-sm border border-white/5">🏥</div>
                                                    <span className="font-bold text-white">{row.bankName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-accent-400">₹{row.incoming.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-bold text-danger-400">₹{row.outgoing.toLocaleString()}</td>
                                            <td className={`px-8 py-6 font-black text-lg ${row.net >= 0 ? 'text-accent-500' : 'text-danger-500'}`}>
                                                {row.net >= 0 ? '+' : ''}₹{row.net.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!summaryData || summaryData.summary.length === 0) && (
                                <div className="p-20 text-center text-dark-500 font-medium">No transactions found for this month.</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="glass-card space-y-8">
                            <h3 className="text-xl font-bold text-white">Forecast Settings</h3>
                            <div>
                                <label className="block text-xs font-semibold text-dark-400 mb-3">Which bank?</label>
                                <select
                                    className="w-full px-6 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                >
                                    {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-dark-400 mb-3">How far ahead? (days)</label>
                                <input
                                    type="range" min="7" max="180"
                                    className="w-full h-2 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-dark-500">
                                    <span>7 DAYS</span>
                                    <span className="text-primary-400 font-black">{days} DAYS</span>
                                    <span>180 DAYS</span>
                                </div>
                            </div>
                            <button
                                onClick={fetchPrediction}
                                disabled={loading || !selectedBank}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Run Forecast →
                            </button>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            {predictionData ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="metric-orb glass-card">
                                            <p className="text-xs font-medium text-dark-500 mb-2">Expected coming in</p>
                                            <p className="text-3xl font-black text-accent-400 tracking-tighter">₹{predictionData.predictedIncoming.toLocaleString()}</p>
                                        </div>
                                        <div className="metric-orb glass-card">
                                            <p className="text-xs font-medium text-dark-500 mb-2">Expected going out</p>
                                            <p className="text-3xl font-black text-danger-400 tracking-tighter">₹{predictionData.predictedOutgoing.toLocaleString()}</p>
                                        </div>
                                        <div className="metric-orb glass-card border-primary-500/20 bg-primary-500/5">
                                            <p className="text-xs font-medium text-primary-400 mb-2">Net change</p>
                                            <p className={`text-3xl font-black tracking-tighter ${predictionData.netPredicted >= 0 ? 'text-accent-500' : 'text-danger-500'}`}>
                                                ₹{predictionData.netPredicted.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="glass-card bg-gradient-to-br from-dark-900/60 to-primary-900/10 p-10">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-16 h-16 rounded-3xl bg-primary-500 flex items-center justify-center text-3xl shadow-2xl shadow-primary-500/20">🧠</div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white leading-tight">How we forecast</h3>
                                                <p className="text-dark-500 text-xs font-medium">Based on your transaction patterns</p>
                                            </div>
                                        </div>
                                        <p className="text-dark-400 font-medium leading-relaxed mb-6">
                                            We look at how your money has been moving over the past {predictionData.days} days — how often and how much. From that, we estimate what’s likely coming next. It’s not perfect, but it gives you a solid picture.
                                        </p>
                                        <div className="p-4 rounded-xl bg-dark-950 border border-white/5 text-xs font-medium text-primary-400 text-center">
                                            Estimated accuracy: ~85%
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="glass-card h-full flex flex-col items-center justify-center p-20 text-center border-dashed border-2 border-white/5">
                                    <div className="w-20 h-20 bg-dark-900 rounded-3xl flex items-center justify-center text-4xl mb-6 grayscale opacity-50">🔮</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Ready when you are</h3>
                                    <p className="text-dark-500 font-medium">Pick a bank and time range to see your forecast.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
