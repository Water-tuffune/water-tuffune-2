import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function WatermanDashboard({ user }) {
  const [stats, setStats] = useState({ total: 0, in_transit: 0, delivered: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [available, setAvailable] = useState([]);
  const [declined, setDeclined] = useState([]);

  useEffect(() => {
    axios.get('/api/users/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
    axios.get('/api/users/orders').then((r) => setDeliveries(r.data)).catch(() => {});
    axios.get('/api/users/orders/available').then((r) => setAvailable(r.data)).catch(() => {});
  }, []);

  const handleStatus = (id, status) => {
    axios.put(`/api/users/orders/${id}/status`, { status }).then(() => {
      setDeliveries(deliveries.map(o => o.id === id ? { ...o, status } : o));
      setAvailable(available.filter(o => o.id !== id));
    }).catch(() => {});
  };

  const claimOrder = (id) => {
    axios.put(`/api/users/orders/${id}/status`, { status: 'assigned' }).then(() => {
      const claimed = available.find(o => o.id === id);
      if (claimed) {
        setDeliveries([{ ...claimed, status: 'assigned', waterman_name: user.name }, ...deliveries]);
        setAvailable(available.filter(o => o.id !== id));
      }
    }).catch(() => {});
  };

  const declineOrder = (id) => {
    setDeclined([...declined, id]);
  };

  const visibleAvailable = available.filter(o => !declined.includes(o.id));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Waterman Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Your delivery assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Jobs', value: stats.total, icon: '📦', color: 'bg-orange-50 text-orange-600' },
          { label: 'In Transit', value: stats.in_transit, icon: '🚚', color: 'bg-water-50 text-water-600' },
          { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'bg-green-50 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`bg-white dark:bg-gray-800 rounded-xl border mb-6 ${visibleAvailable.length > 0 ? 'border-water-200' : 'border-gray-200 dark:border-gray-700'}`}>
        <div className={`px-6 py-4 border-b rounded-t-xl flex items-center justify-between ${visibleAvailable.length > 0 ? 'border-water-100 bg-water-50 dark:bg-water-900/20 dark:border-water-800' : 'border-gray-100 bg-gray-50 dark:bg-gray-900/50'}`}>
          <h2 className={`text-lg font-semibold ${visibleAvailable.length > 0 ? 'text-water-800 dark:text-water-300' : 'text-gray-600 dark:text-gray-400'}`}>
            Accept Deliveries from Suppliers
          </h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${visibleAvailable.length > 0 ? 'bg-water-200 text-water-800 dark:text-water-300' : 'bg-gray-200 text-gray-600 dark:text-gray-400'}`}>
            {visibleAvailable.length} available
          </span>
        </div>
        {visibleAvailable.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-3xl mb-2">🚚</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">No deliveries available right now.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back when a supplier accepts an order.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {visibleAvailable.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{order.water_type} · {order.quantity}L · {order.district}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">From: {order.supplier_name || order.station_name || 'Supplier'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => claimOrder(order.id)}
                    className="text-xs px-4 py-2 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors font-medium">
                    Accept
                  </button>
                  <button onClick={() => declineOrder(order.id)}
                    className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Deliveries</h2>
          <Link to="/orders/track" className="text-sm text-orange-600">View all</Link>
        </div>
        {deliveries.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm py-12 text-center">
            {available.length > 0 ? 'Claim a delivery above to get started!' : 'No deliveries assigned yet.'}
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {deliveries.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{order.water_type} · {order.quantity}L</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{order.address} · {order.district}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    order.status === 'assigned' ? 'bg-indigo-100 text-indigo-700' :
                    order.status === 'in_transit' ? 'bg-water-100 text-water-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{order.status}</span>
                  {order.status === 'assigned' && (
                    <button onClick={() => handleStatus(order.id, 'in_transit')}
                      className="text-xs px-3 py-1.5 bg-water-100 text-water-700 rounded-lg hover:bg-water-200">
                      Pick Up
                    </button>
                  )}
                  {order.status === 'in_transit' && (
                    <button onClick={() => handleStatus(order.id, 'delivered')}
                      className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
