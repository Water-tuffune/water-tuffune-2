import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const roles = [
  { id: 'customer', label: 'Customer', icon: '👤' },
  { id: 'supplier', label: 'Supplier', icon: '🏪' },
  { id: 'waterman', label: 'Waterman', icon: '🚚' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

export default function Login({ setUser }) {
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role && roles.find(r => r.id === role)) setSelectedRole(role);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { ...form, role: selectedRole };

      const { data } = await axios.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);

      const dashboards = { customer: '/customer/dashboard', supplier: '/supplier/dashboard', waterman: '/waterman/dashboard', admin: '/admin/dashboard' };
      navigate(dashboards[data.user.role]);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
            ← Back to home
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to Water Tuffune</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a...</label>
              <div className="grid grid-cols-4 gap-3">
                {roles.map((role) => (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)}
                    className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                      selectedRole === role.id
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}>
                    <div className="text-2xl leading-none mb-1.5">{role.icon}</div>
                    <div className={`text-[11px] font-medium leading-tight ${selectedRole === role.id ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {role.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                Sign In
              </button>
              <button onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                Register
              </button>
            </div>

            {!isLogin && (
              <div className="mb-4 p-3 bg-water-50 dark:bg-water-900/30 rounded-lg text-xs text-water-700 dark:text-water-300">
                Registering as <strong className="capitalize">{selectedRole}</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Your full name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="••••••••" />
              </div>
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input type="tel" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="+256 7XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / District</label>
                    <input type="text" value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Kampala, Wakiso, ..." />
                  </div>
                </>
              )}
              {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button type="submit"
                className="w-full py-3 bg-water-600 hover:bg-water-700 dark:bg-water-500 dark:hover:bg-water-600 text-white font-semibold rounded-xl transition-colors text-sm">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
