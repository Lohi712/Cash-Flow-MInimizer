import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/banks', label: 'Banks', icon: '🏦' },
    { path: '/transactions', label: 'Transactions', icon: '💸' },
    { path: '/optimizer', label: 'Optimizer', icon: '⚡' },
    { path: '/reports', label: 'Reports', icon: '📈' },
];

export default function Layout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 glass flex flex-col fixed h-screen z-10">
                <div className="p-6 border-b border-primary-500/20">
                    <h1 className="text-xl font-bold gradient-text">CashFlow</h1>
                    <p className="text-xs text-dark-400 mt-1">Minimizer</p>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map(({ path, label, icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                                    : 'text-dark-300 hover:bg-dark-800/50 hover:text-dark-100'
                                }`
                            }
                        >
                            <span className="text-lg">{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-primary-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 text-sm text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}
