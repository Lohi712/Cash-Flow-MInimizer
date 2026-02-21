import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Layout() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Overview', icon: '🌌' },
        { path: '/banks', label: 'Banks', icon: '🏦' },
        { path: '/transactions', label: 'Transactions', icon: '💸' },
        { path: '/optimizer', label: 'Optimizer', icon: '⚡' },
        { path: '/reports', label: 'Analytics', icon: '📊' },
    ];

    return (
        <div className="app-container">
            <div className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 z-[60] pointer-events-none">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-xl bg-dark-900/60 backdrop-blur-md border border-white/5 flex flex-col items-center justify-center gap-1.5 pointer-events-auto hover:bg-dark-800 transition-all hover:scale-110 active:scale-95 group shadow-xl"
                >
                    <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <nav className={`floating-nav transition-all duration-500 ease-nebula ${isOpen ? 'translate-x-0' : '-translate-x-[110%]'}`}>
                <div className="p-8 pb-4 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/20">
                            💵
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white leading-none">Minimizer</h2>
                            <p className="text-[10px] uppercase tracking-widest text-dark-500 font-bold mt-1">Cash Flow Engine</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-dark-800/40">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-dark-500 font-medium truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/2 text-dark-400 font-semibold hover:bg-danger-500/10 hover:text-danger-400 hover:border-danger-500/20 transition-all duration-300"
                        >
                            <span>🚪</span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className={`main-content mt-16 ${isOpen ? 'lg:ml-80' : 'ml-0'}`}>
                <div className="mb-10 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-dark-500 uppercase tracking-widest ml-12 lg:ml-0">
                        <span>Pages</span>
                        <span className="text-dark-700">/</span>
                        <span className="text-primary-400">{location.pathname === '/' ? 'Overview' : location.pathname.split('/')[1]}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900/40 border border-white/5 text-[10px] font-bold text-accent-500 uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                            Node Engine Active
                        </div>
                    </div>
                </div>

                <Outlet />
            </main>
        </div>
    );
}
