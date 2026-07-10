import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const waterTypes = ['Purified Water', 'Mineral Water', 'Spring Water', 'Alkaline Water', 'Distilled Water'];
const ugandaDistricts = ['Kampala', 'Wakiso', 'Mukono', 'Entebbe', 'Jinja', 'Mbale', 'Gulu', 'Mbarara', 'Masaka', 'Lira', 'Soroti', 'Fort Portal', 'Arua', 'Kabale', 'Busia'];

export default function PlaceOrder({ user }) {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    water_type: waterTypes[0], quantity: 20, address: '',
    district: '', phone: user?.phone || '', supplier_id: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('/api/users/suppliers/active').then((r) => setSuppliers(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/users/orders', {
        ...form,
        quantity: parseInt(form.quantity),
        supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      });
      navigate(`/orders/${data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Place an Order</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Order clean water for delivery</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Water Type</label>
            <select value={form.water_type} onChange={(e) => setForm({ ...form, water_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm">
              {waterTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity (litres)</label>
            <input type="number" min="1" max="10000" required value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Address</label>
          <input type="text" required value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm"
            placeholder="Street, building, landmark..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">District</label>
            <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm">
              <option value="">Select district</option>
              {ugandaDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
            <input type="tel" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm"
              placeholder="+256 7XX XXX XXX" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Preferred Supplier (optional)</label>
          <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm">
            <option value="">Any available supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.station_name} - {s.district}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none text-sm"
            rows={2} placeholder="Any special instructions..." />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-water-600 hover:bg-water-700 disabled:bg-water-400 text-white font-semibold rounded-xl transition-colors">
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
