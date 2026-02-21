import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBanks, addBank, removeBank, setLoading } from '../store/bankSlice';
import { banksAPI } from '../services/api';

const PAYMENT_TYPE_OPTIONS = ['UPI', 'NEFT', 'RTGS', 'IMPS', 'Credit Card', 'Debit Card', 'Wire Transfer'];

export default function Banks() {
    const dispatch = useDispatch();
    const { list: banks, loading } = useSelector((state) => state.banks);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', paymentTypes: [] });
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(setLoading(true));
        banksAPI.getAll()
            .then(res => dispatch(setBanks(res.data)))
            .catch(() => dispatch(setLoading(false)));
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.paymentTypes.length === 0) {
            setError('Select at least one payment type.');
            return;
        }
        try {
            const { data } = await banksAPI.create(form);
            dispatch(addBank(data));
            setForm({ name: '', paymentTypes: [] });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add bank');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this bank and all its transactions?')) return;
        try {
            await banksAPI.delete(id);
            dispatch(removeBank(id));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const toggleType = (type) => {
        setForm(prev => ({
            ...prev,
            paymentTypes: prev.paymentTypes.includes(type)
                ? prev.paymentTypes.filter(t => t !== type)
                : [...prev.paymentTypes, type],
        }));
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Banks</h1>
                    <p className="text-dark-400 mt-1">Manage your banks and payment types</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-600/20"
                >
                    {showForm ? 'Cancel' : '+ Add Bank'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                    {error}
                </div>
            )}

            {/* Add Bank Form */}
            {showForm && (
                <div className="glass-card mb-6 animate-slide-in">
                    <h3 className="text-lg font-semibold mb-4">Add New Bank</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Bank Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50 transition-all"
                                placeholder="e.g., HDFC Bank"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-2">Payment Types</label>
                            <div className="flex flex-wrap gap-2">
                                {PAYMENT_TYPE_OPTIONS.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleType(type)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${form.paymentTypes.includes(type)
                                                ? 'bg-primary-600/30 text-primary-300 border border-primary-500/50'
                                                : 'bg-dark-800/40 text-dark-400 border border-dark-600/30 hover:border-dark-500'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-accent-500 text-white font-medium rounded-xl hover:bg-accent-600 transition-all"
                        >
                            Add Bank
                        </button>
                    </form>
                </div>
            )}

            {/* Banks List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
                </div>
            ) : banks.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <p className="text-4xl mb-3">🏦</p>
                    <p className="text-dark-400">No banks added yet. Click "Add Bank" to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {banks.map(bank => (
                        <div key={bank._id} className="glass-card animate-slide-in">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{bank.name}</h3>
                                    <p className={`text-sm font-medium mt-1 ${bank.netAmount > 0 ? 'text-accent-400' : bank.netAmount < 0 ? 'text-danger-400' : 'text-dark-400'
                                        }`}>
                                        {bank.netAmount > 0 ? '+' : ''}₹{bank.netAmount.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(bank._id)}
                                    className="text-dark-500 hover:text-danger-400 transition-colors text-lg"
                                    title="Delete"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {bank.paymentTypes.map(type => (
                                    <span key={type} className="px-2 py-0.5 bg-primary-600/15 text-primary-300 rounded-md text-xs font-medium">
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
