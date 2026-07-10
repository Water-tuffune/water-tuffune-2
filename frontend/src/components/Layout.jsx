import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const roleConfig = {
  customer: { label: 'Customer', color: 'blue' },
  supplier: { label: 'Supplier', color: 'green' },
  waterman: { label: 'Waterman', color: 'orange' },
  admin: { label: 'Admin', color: 'purple' },
};

const navByRole = {
  customer: [
    { path: '/customer/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders/new', label: 'Place Order', icon: '🛒' },
    { path: '/orders/track', label: 'Track Order', icon: '📍' },
    { path: '/ussd', label: 'USSD / Offline', icon: '📱' },
  ],
  supplier: [
    { path: '/supplier/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders/track', label: 'Orders', icon: '📦' },
    { path: '/ussd', label: 'USSD / Offline', icon: '📱' },
  ],
  waterman: [
    { path: '/waterman/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders/track', label: 'Deliveries', icon: '🚚' },
    { path: '/ussd', label: 'USSD / Offline', icon: '📱' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders/track', label: 'All Orders', icon: '📦' },
    { path: '/ussd', label: 'USSD / Offline', icon: '📱' },
  ],
};

export default function Layout({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const config = roleConfig[user?.role] || roleConfig.customer;
  const navItems = navByRole[user?.role] || navByRole.customer;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-30">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: config.color === 'blue' ? '#3b82f6' : config.color === 'green' ? '#22c55e' : config.color === 'orange' ? '#f97316' : '#a855f7' }}>
              WT
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">Water Tuffune</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{config.label} Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-water-50 dark:bg-water-900/30 text-water-700 dark:text-water-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 mb-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {theme === 'dark' ? (
              <><span className="text-lg">☀️</span> Light Mode</>
            ) : (
              <><span className="text-lg">🌙</span> Dark Mode</>
            )}
          </button>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: config.color === 'blue' ? '#3b82f6' : config.color === 'green' ? '#22c55e' : config.color === 'orange' ? '#f97316' : '#a855f7' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left">
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
