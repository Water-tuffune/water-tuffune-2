import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusSteps = ['pending', 'accepted', 'assigned', 'in_transit', 'delivered'];

export default function OrderDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`/api/users/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {});
    axios.get(`/api/users/orders/${id}/tracking`).then((r) => setTracking(r.data)).catch(() => {});
    if (user?.role === 'admin') {
      axios.get('/api/users/admin/users').then((r) => setUsers(r.data)).catch(() => {});
    }
  }, [id]);

  const cancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.put(`/api/users/orders/${id}/status`, { status: 'cancelled' });
      setOrder({ ...order, status: 'cancelled' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const updateOrder = async () => {
    try {
      await axios.put(`/api/users/admin/orders/${id}`, form);
      setOrder({ ...order, ...form });
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const reassign = async (field, value) => {
    try {
      const payload = {};
      payload[field] = value || null;
      await axios.put(`/api/users/admin/orders/${id}/reassign`, payload);
      const key = field === 'supplier_id' ? 'supplier_name' : 'waterman_name';
      const userObj = users.find(u => u.id === value);
      setOrder({ ...order, [field]: value, [key]: userObj?.name || 'Unassigned' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reassign');
    }
  };

  const canCancel = order && (
    (user.role === 'customer' && ['pending', 'accepted'].includes(order.status)) ||
    user.role === 'admin'
  );

  if (!order) return (
    <div className="p-8 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-water-500 border-t-transparent rounded-full mx-auto"></div>
    </div>
  );

  const currentStep = statusSteps.indexOf(order.status);
  const suppliers = users.filter(u => u.role === 'supplier');
  const watermen = users.filter(u => u.role === 'waterman');

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Link to="/orders/track" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-block">← Back to orders</Link>
        {user?.role === 'admin' && (
          <button onClick={() => { setEditing(!editing); if (!editing) setForm({ water_type: order.water_type, quantity: order.quantity, address: order.address, district: order.district, phone: order.phone, notes: order.notes }); }}
            className="text-sm px-3 py-1.5 bg-water-100 dark:bg-water-900/30 text-water-700 dark:text-water-300 rounded-lg hover:bg-water-200 dark:hover:bg-water-900/50 transition-colors">
            {editing ? 'Cancel Edit' : '✏️ Edit Order'}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()} · {new Date(order.created_at).toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'in_transit' ? 'bg-water-100 text-water-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              order.status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>{order.status}</span>
            {canCancel && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button onClick={cancelOrder}
                className="text-sm px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Water Type</label>
                <input value={form.water_type} onChange={(e) => setForm({...form, water_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quantity (L)</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
              <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">District</label>
                <input value={form.district} onChange={(e) => setForm({...form, district: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <button onClick={updateOrder}
              className="px-4 py-2 bg-water-600 text-white rounded-lg hover:bg-water-700 text-sm font-medium">
              Save Changes
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Water Type', value: order.water_type },
                { label: 'Quantity', value: `${order.quantity} litres` },
                { label: 'District', value: order.district },
                { label: 'Payment', value: order.payment_method || '—' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Delivery Address</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{order.address}</p>
            </div>

            {order.notes && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.notes}</p>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Customer</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Supplier</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{order.supplier_name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Waterman</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{order.waterman_name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Phone</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{order.phone || '—'}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {user?.role === 'admin' && !editing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">⚙️ Admin — Reassign</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Supplier</label>
              <select onChange={(e) => reassign('supplier_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Unassign supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id} selected={s.id === order.supplier_id}>{s.name} ({s.location || '—'})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Waterman</label>
              <select onChange={(e) => reassign('waterman_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Unassign waterman</option>
                {watermen.map(w => <option key={w.id} value={w.id} selected={w.id === order.waterman_id}>{w.name} ({w.phone || '—'})</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Tracking Timeline</h2>
        <div className="relative">
          {statusSteps.map((step, i) => {
            const done = i <= currentStep;
            const isLast = i === statusSteps.length - 1;
            const trackingEntry = tracking.find(t => t.status === step);
            return (
              <div key={step} className="flex gap-4 pb-6 relative">
                {!isLast && <div className={`absolute left-[11px] top-6 w-0.5 h-full ${done ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <div className="flex-1 -mt-1">
                  <p className={`text-sm font-medium ${done ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {step.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </p>
                  {trackingEntry && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(trackingEntry.created_at).toLocaleString()}
                      {trackingEntry.notes && <span className="text-gray-500 dark:text-gray-400 ml-2">— {trackingEntry.notes}</span>}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
