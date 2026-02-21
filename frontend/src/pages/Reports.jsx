import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBanks } from '../store/bankSlice';
import { analyticsAPI, banksAPI } from '../services/api';

export default function Reports() {
    const dispatch = useDispatch();
    const { list: banks } = useSelector((state) => state.banks);
    const [activeTab, setActiveTab] = useState('summary');
    const [summary, setSummary] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [predBankId, setPredBankId] = useState('');
    const [predDays, setPredDays] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        banksAPI.getAll().then(res => dispatch(setBanks(res.data))).catch(() => { });
    }, [dispatch]);

    const fetchSummary = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await analyticsAPI.getSummary(month, year);
            setSummary(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch summary');
        } finally {
            setLoading(false);
        }
    };

    const fetchPrediction = async () => {
        if (!predBankId) { setError('Select a bank'); return; }
        setLoading(true);
        setError('');
        try {
            const { data } = await analyticsAPI.getPrediction(predBankId, predDays);
            setPrediction(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch prediction');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'summary', label: 'Monthly Summary', icon: '📊' },
        { key: 'prediction', label: 'Cash Flow Prediction', icon: '🔮' },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
                <p className="text-dark-400 mt-1">Insights and predictions for your cash flow network</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => { setActiveTab(key); setError(''); }}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === key
                                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                                : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200 border border-transparent'
                            }`}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                    {error}
                </div>
            )}

            {/* Monthly Summary Tab */}
            {activeTab === 'summary' && (
                <div className="space-y-6">
                    <div className="glass-card">
                        <div className="flex items-end gap-4">
                            <div>
                                <label className="block text-xs text-dark-400 mb-1">Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(parseInt(e.target.value))}
                                    className="px-4 py-2.5 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-dark-400 mb-1">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-24 px-4 py-2.5 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50"
                                />
                            </div>
                            <button
                                onClick={fetchSummary}
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Generate'}
                            </button>
                        </div>
                    </div>

                    {summary && (
                        <div className="glass-card animate-slide-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-primary-300">
                                    {new Date(2000, summary.month - 1).toLocaleString('default', { month: 'long' })} {summary.year}
                                </h3>
                                <span className="text-sm text-dark-400">{summary.totalTransactions} transactions</span>
                            </div>
                            {summary.summary.length === 0 ? (
                                <p className="text-dark-500">No data for this period.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-dark-400 border-b border-dark-700">
                                                <th className="text-left py-3 px-2">Bank</th>
                                                <th className="text-right py-3 px-2">Incoming</th>
                                                <th className="text-right py-3 px-2">Outgoing</th>
                                                <th className="text-right py-3 px-2">Net</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary.summary.map(row => (
                                                <tr key={row.bankId} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                                                    <td className="py-3 px-2 font-medium">{row.bankName}</td>
                                                    <td className="py-3 px-2 text-right text-accent-400">₹{row.incoming.toLocaleString()}</td>
                                                    <td className="py-3 px-2 text-right text-danger-400">₹{row.outgoing.toLocaleString()}</td>
                                                    <td className={`py-3 px-2 text-right font-bold ${row.net >= 0 ? 'text-accent-400' : 'text-danger-400'}`}>
                                                        {row.net >= 0 ? '+' : ''}₹{row.net.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Prediction Tab */}
            {activeTab === 'prediction' && (
                <div className="space-y-6">
                    <div className="glass-card">
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-xs text-dark-400 mb-1">Bank</label>
                                <select
                                    value={predBankId}
                                    onChange={(e) => setPredBankId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50"
                                >
                                    <option value="">Select bank</option>
                                    {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-dark-400 mb-1">Days</label>
                                <input
                                    type="number"
                                    value={predDays}
                                    onChange={(e) => setPredDays(parseInt(e.target.value))}
                                    className="w-24 px-4 py-2.5 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50"
                                    min={1}
                                />
                            </div>
                            <button
                                onClick={fetchPrediction}
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Predict'}
                            </button>
                        </div>
                    </div>

                    {prediction && (
                        <div className="glass-card animate-slide-in">
                            <h3 className="text-lg font-bold text-primary-300 mb-4">
                                {prediction.bankName} — {prediction.days} Day Forecast
                            </h3>
                            {prediction.message ? (
                                <p className="text-dark-500">{prediction.message}</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="bg-dark-800/40 rounded-xl p-4 text-center">
                                        <p className="text-xs text-dark-400 mb-1">Predicted Incoming</p>
                                        <p className="text-2xl font-bold text-accent-400">₹{prediction.predictedIncoming.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-dark-800/40 rounded-xl p-4 text-center">
                                        <p className="text-xs text-dark-400 mb-1">Predicted Outgoing</p>
                                        <p className="text-2xl font-bold text-danger-400">₹{prediction.predictedOutgoing.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-dark-800/40 rounded-xl p-4 text-center">
                                        <p className="text-xs text-dark-400 mb-1">Net Predicted Flow</p>
                                        <p className={`text-2xl font-bold ${prediction.netPredicted >= 0 ? 'text-accent-400' : 'text-danger-400'}`}>
                                            {prediction.netPredicted >= 0 ? '+' : ''}₹{prediction.netPredicted.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
