import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusOrder = ['pending', 'accepted', 'assigned', 'in_transit', 'delivered'];

export default function TrackOrder({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/users/orders').then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Track Orders</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and monitor all your orders</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {['all', 'pending', 'accepted', 'assigned', 'in_transit', 'delivered', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-water-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const stepIndex = statusOrder.indexOf(order.status);
            const canCancel = (user.role === 'customer' && ['pending', 'accepted'].includes(order.status)) ||
                               user.role === 'admin';

            const handleCancel = async (e) => {
              e.stopPropagation();
              if (!confirm('Cancel this order?')) return;
              try {
                await axios.put(`/api/users/orders/${order.id}/status`, { status: 'cancelled' });
                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
              } catch (err) {
                alert(err.response?.data?.error || 'Failed to cancel');
              }
            };

            return (
              <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)}
                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Order #{order.id}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-3">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'in_transit' ? 'bg-water-100 text-water-700' :
                      order.status === 'accepted' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                    {canCancel && (
                      <button onClick={handleCancel}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Type</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{order.water_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Quantity</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{order.quantity}L</p>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">District</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{order.district}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">{user?.role === 'customer' ? 'Supplier' : 'Customer'}</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer_name || order.supplier_name || '—'}</p>
                  </div>
                </div>
                {stepIndex >= 0 && stepIndex < statusOrder.length - 1 && (
                  <div className="mt-3 flex items-center gap-1.5">
                    {statusOrder.slice(0, stepIndex + 1).map((s, i) => (
                      <span key={s} className="flex items-center gap-1 text-xs">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                        <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">{s}</span>
                        {i < stepIndex && <span className="text-gray-300 mx-0.5">—</span>}
                      </span>
                    ))}
                    <span className="text-xs text-water-500 animate-pulse ml-1">In progress...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
