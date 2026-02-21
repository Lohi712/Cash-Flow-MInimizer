import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/authSlice';
import { authAPI } from '../services/api';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const { data } = isRegister
                ? await authAPI.register(form)
                : await authAPI.login({ email: form.email, password: form.password });
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            navigate('/');
        } catch (err) {
            dispatch(loginFailure(err.response?.data?.error || 'Something went wrong'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-500/15 rounded-full blur-[100px]" />

            <div className="glass-card w-full max-w-md animate-fade-in relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">CashFlow Minimizer</h1>
                    <p className="text-dark-400">
                        {isRegister ? 'Create your account' : 'Sign in to continue'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                    >
                        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-dark-400 mt-6">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => { setIsRegister(!isRegister); dispatch(clearError()); }}
                        className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                        {isRegister ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
}
