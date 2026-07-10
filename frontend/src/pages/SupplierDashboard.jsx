import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SupplierDashboard({ user }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0 });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/users/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
    axios.get('/api/users/orders').then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  const handleStatus = (id, status) => {
    axios.put(`/api/users/orders/${id}/status`, { status }).then(() => {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }).catch(() => {});
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const respondedOrders = orders.filter(o => o.status === 'accepted' || o.status === 'rejected');

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Supplier Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Manage your water station</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, icon: '📦', color: 'bg-green-50 text-green-600' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'bg-green-50 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 mb-6">
        <div className="px-6 py-4 border-b border-yellow-100 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-xl flex items-center justify-between">
          <h2 className="text-lg font-semibold text-yellow-800">New Orders — Accept or Decline</h2>
          {pendingOrders.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-200 text-yellow-800 font-medium">{pendingOrders.length} waiting</span>
          )}
        </div>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm py-10 text-center">No pending orders.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pendingOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{order.water_type} · {order.quantity}L · {order.district}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStatus(order.id, 'accepted')}
                    className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                    Accept
                  </button>
                  <button onClick={() => handleStatus(order.id, 'rejected')}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {respondedOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Responded Orders</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {respondedOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{order.water_type} · {order.quantity}L</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  order.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
