import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import api from '../services/api';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await api.post(endpoint, formData);
            dispatch(loginSuccess(data));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl shadow-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                        💵
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">MINIMIZER</h1>
                    <p className="text-dark-500 font-bold uppercase tracking-[0.3em] text-[10px]">Financial Graph Engine</p>
                </div>

                <div className="glass-card p-10 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>

                    <h2 className="text-2xl font-bold text-white mb-8 text-center">{isLogin ? 'Welcome Back' : 'Create Protocol'}</h2>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm font-medium animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-widest mb-2 ml-1">Identity Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-dark-700 font-medium"
                                    placeholder="e.g. Satoshi Nakamoto"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-dark-500 uppercase tracking-widest mb-2 ml-1">Access Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-dark-700 font-medium"
                                placeholder="name@nexus.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-dark-500 uppercase tracking-widest mb-2 ml-1">Security Key</label>
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-dark-950/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-dark-700 font-medium"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Initialize Session' : 'Generate Core'}</span>
                                    <span className="text-xl">🚀</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold text-dark-400 hover:text-primary-400 transition-colors"
                        >
                            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
