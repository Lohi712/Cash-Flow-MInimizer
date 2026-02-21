import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Banks() {
    const [banks, setBanks] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', paymentTypes: [] });
    const [loading, setLoading] = useState(true);

    const availablePayments = ['UPI', 'IMPS', 'RTGS', 'NEFT', 'SWIFT'];

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const { data } = await api.get('/banks');
            setBanks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBank = async (e) => {
        e.preventDefault();
        try {
            await api.post('/banks', formData);
            setFormData({ name: '', paymentTypes: [] });
            setIsAdding(false);
            fetchBanks();
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('This will delete all associated transactions. Proceed?')) return;
        try {
            await api.delete(`/banks/${id}`);
            fetchBanks();
        } catch (err) {
            console.error(err);
        }
    };

    const togglePayment = (type) => {
        setFormData(prev => ({
            ...prev,
            paymentTypes: prev.paymentTypes.includes(type)
                ? prev.paymentTypes.filter(t => t !== type)
                : [...prev.paymentTypes, type]
        }));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Banking Nodes</h1>
                    <p className="text-dark-400 font-medium">Manage your financial endpoints and settlement protocols.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-xl ${isAdding ? 'bg-dark-900 text-white border border-white/10' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20'}`}
                >
                    {isAdding ? 'Cancel Entry' : 'Register New Node'}
                    <span className="text-xl">{isAdding ? '✖' : '➕'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="glass-card mb-12 border-primary-500/20 relative overflow-hidden animate-slide-down">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-accent-500"></div>
                    <form onSubmit={handleAddBank} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                            <label className="block text-xs font-black text-dark-500 uppercase tracking-[0.2em] mb-4">Bank Internal Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-6 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-lg placeholder:text-dark-800"
                                placeholder="e.g. JPMorgan Core"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-dark-500 uppercase tracking-[0.2em] mb-4">Settlement Protocols</label>
                            <div className="flex flex-wrap gap-3">
                                {availablePayments.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => togglePayment(type)}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${formData.paymentTypes.includes(type) ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-900 border-white/5 text-dark-500 hover:border-white/20'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-2 flex justify-end pt-4 border-t border-white/5">
                            <button type="submit" className="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all active:scale-95">
                                Finalize Node Entry ⚡
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {banks.length === 0 ? (
                <div className="glass-card p-20 text-center border-dashed border-2 border-white/5">
                    <div className="w-20 h-20 bg-dark-900 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 grayscale opacity-50">🏛️</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Active Nodes</h3>
                    <p className="text-dark-500 font-medium">Add your first bank to start mapping the network.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {banks.map((bank, i) => (
                        <div
                            key={bank._id}
                            className="glass-card group hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden animate-staggered-fade-in"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br transition-all duration-500 blur-3xl opacity-20 group-hover:opacity-40 -mr-12 -mt-12 ${bank.netAmount >= 0 ? 'from-accent-500 to-blue-600' : 'from-danger-500 to-rose-600'}`}></div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-dark-950 flex items-center justify-center text-2xl border border-white/5 shadow-inner">🏦</div>
                                <button
                                    onClick={() => handleDelete(bank._id)}
                                    className="p-2 text-dark-700 hover:text-danger-400 hover:bg-danger-500/10 rounded-xl transition-all"
                                >
                                    🗑️
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-1 group-hover:text-primary-400 transition-colors leading-tight">{bank.name}</h3>
                            <p className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-6">Internal Banking Node</p>

                            <div className="mb-6 p-4 rounded-2xl bg-dark-950/50 border border-white/5">
                                <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-1">Net Flow Balance</p>
                                <p className={`text-2xl font-black tracking-tighter ${bank.netAmount >= 0 ? 'text-accent-400' : 'text-danger-400'}`}>
                                    {bank.netAmount >= 0 ? '+' : '-'}₹{Math.abs(bank.netAmount).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {bank.paymentTypes.map(type => (
                                    <span key={type} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-dark-400 uppercase tracking-tighter">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
