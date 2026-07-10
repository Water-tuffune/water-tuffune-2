import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ total_orders: 0, customers: 0, suppliers: 0, watermen: 0 });
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    axios.get('/api/users/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
    axios.get('/api/users/orders').then((r) => setOrders(r.data.slice(0, 10))).catch(() => {});
    axios.get('/api/users/admin/activities').then((r) => setActivities(r.data)).catch(() => {});
    axios.get('/api/users/admin/users').then((r) => setUsersList(r.data)).catch(() => {});
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm('Cancel order #' + id + '?')) return;
    try {
      await axios.put(`/api/users/orders/${id}/status`, { status: 'cancelled' });
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Water Tuffune platform overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: stats.total_orders, icon: '📦', color: 'bg-purple-50 text-purple-600' },
          { label: 'Customers', value: stats.customers, icon: '👤', color: 'bg-water-50 text-water-600' },
          { label: 'Suppliers', value: stats.suppliers, icon: '🏪', color: 'bg-green-50 text-green-600' },
          { label: 'Watermen', value: stats.watermen, icon: '🚚', color: 'bg-orange-50 text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'active', label: `Active Orders (${activeOrders.length})` },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'activity', label: 'Activity Log' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-water-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Orders</h2>
            {activeOrders.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">No active orders.</p>
            ) : (
              <div className="space-y-3">
                {activeOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <Link to={`/orders/${order.id}`} className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">#{order.id} — {order.water_type}</p>
                      <p className="text-xs text-gray-500">{order.customer_name} · {order.quantity}L · {order.district}</p>
                    </Link>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'in_transit' ? 'bg-water-100 text-water-700' :
                      order.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'accepted' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/orders/track" className="text-sm text-water-600 mt-3 inline-block">View all orders →</Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">No recent activity.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activities.slice(0, 10).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-water-500 mt-1.5 flex-shrink-0"></span>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">
                        Order <Link to={`/orders/${a.order_id}`} className="text-water-600 font-medium">#{a.order_id}</Link>
                        {' → '}<span className="font-medium">{a.status}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleString()}
                        {a.notes && <span className="ml-1 text-gray-500">— {a.notes}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'active' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Qty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">District</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order.id}`} className="text-sm font-medium text-water-600">#{order.id}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{order.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.water_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.quantity}L</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.district}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'in_transit' ? 'bg-water-100 text-water-700' :
                        order.status === 'accepted' ? 'bg-indigo-100 text-indigo-700' :
                        order.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button onClick={() => cancelOrder(order.id)}
                          className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'supplier' ? 'bg-green-100 text-green-700' :
                        u.role === 'waterman' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.location || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">All Activity</h2>
          {activities.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No activities recorded.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.status === 'cancelled' ? 'bg-red-500' :
                    a.status === 'delivered' ? 'bg-green-500' :
                    'bg-water-500'
                  }`}></span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Order <Link to={`/orders/${a.order_id}`} className="text-water-600">#{a.order_id}</Link>
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.created_at).toLocaleString()}
                      {a.notes && <span className="ml-1">— {a.notes}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}