import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Landing from './pages/Landing';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import WatermanDashboard from './pages/WatermanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlaceOrder from './pages/PlaceOrder';
import TrackOrder from './pages/TrackOrder';
import OrderDetail from './pages/OrderDetail';
import UssdOffline from './pages/UssdOffline';
import About from './pages/About';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/users/me')
        .then((res) => setUser(res.data))
        .catch(() => { localStorage.removeItem('token'); delete axios.defaults.headers.common['Authorization']; })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-water-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-water-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Water Tuffune...</p>
        </div>
      </div>
    );
  }

  const roleDashboard = {
    customer: '/customer/dashboard',
    supplier: '/supplier/dashboard',
    waterman: '/waterman/dashboard',
    admin: '/admin/dashboard',
  };

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={roleDashboard[user.role]} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={roleDashboard[user.role]} /> : <Login setUser={setUser} />} />
      <Route path="/about" element={<About />} />

      {user && (
        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route path="/customer/dashboard" element={user.role === 'customer' ? <CustomerDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/supplier/dashboard" element={user.role === 'supplier' ? <SupplierDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/waterman/dashboard" element={user.role === 'waterman' ? <WatermanDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/admin/dashboard" element={user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/orders/new" element={user.role === 'customer' ? <PlaceOrder user={user} /> : <Navigate to="/" />} />
          <Route path="/orders/track" element={<TrackOrder user={user} />} />
          <Route path="/orders/:id" element={<OrderDetail user={user} />} />
          <Route path="/ussd" element={<UssdOffline />} />
          <Route path="/profile" element={<div className="p-8"><h1 className="text-2xl font-bold">Profile</h1><p className="text-gray-500 mt-2">Coming soon</p></div>} />
        </Route>
      )}
    </Routes>
  );
}

export default App;
