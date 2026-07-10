import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CustomerDashboard({ user }) {
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, cancelled: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/users/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
    axios.get('/api/users/orders').then((r) => setRecentOrders(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.put(`/api/users/orders/${id}/status`, { status: 'cancelled' });
      setRecentOrders(recentOrders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const canCancel = (status) => ['pending', 'accepted'].includes(status);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, icon: '📦', color: 'bg-water-50 text-water-600' },
          { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link to="/orders/new" className="flex items-center gap-4 p-4 bg-water-50 rounded-xl hover:bg-water-100 transition-colors">
              <div className="w-12 h-12 bg-water-500 rounded-xl flex items-center justify-center text-white text-xl">🛒</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Place New Order</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order clean water for delivery</p>
              </div>
            </Link>
            <Link to="/orders/track" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/500 rounded-xl flex items-center justify-center text-white text-xl">📍</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Track Order</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">See your delivery status</p>
              </div>
            </Link>
            <Link to="/ussd" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl">📱</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">USSD / Offline Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order without internet</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            <Link to="/orders/track" className="text-sm text-water-600 hover:text-water-700">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No orders yet. Place your first order!</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <Link to={`/orders/${order.id}`} className="flex-1 hover:bg-gray-50 dark:bg-gray-900/50 -mx-2 px-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.water_type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.quantity}L · {new Date(order.created_at).toLocaleDateString()}</p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'in_transit' ? 'bg-water-100 text-water-700' :
                      order.status === 'accepted' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                    {canCancel(order.status) && (
                      <button onClick={() => cancelOrder(order.id)}
                        className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
