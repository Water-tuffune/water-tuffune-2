const express = require('express');
const db = require('../db/init');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  db.get('SELECT id, name, email, phone, role, location, created_at FROM users WHERE id = ?',
    [req.user.id], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json(user);
    });
});

router.put('/profile', authenticate, (req, res) => {
  const { name, phone, location } = req.body;
  db.run('UPDATE users SET name=COALESCE(?,name), phone=COALESCE(?,phone), location=COALESCE(?,location) WHERE id=?',
    [name, phone, location, req.user.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated' });
    });
});

router.get('/suppliers/active', (req, res) => {
  db.all(`SELECT u.id, u.name, u.location, u.phone, s.station_name, s.district, s.water_types
    FROM users u JOIN suppliers s ON u.id = s.user_id WHERE s.is_active = 1`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/orders', authenticate, (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers can place orders.' });
  const { water_type, quantity, address, district, phone, supplier_id, notes } = req.body;
  if (!water_type || !quantity || !address || !district) {
    return res.status(400).json({ error: 'Water type, quantity, address, and district are required.' });
  }

  db.run(
    `INSERT INTO orders (customer_id, supplier_id, water_type, quantity, address, district, phone, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, supplier_id || null, water_type, quantity, address, district, phone || null, notes || null],
    function (err, result) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = result.lastID;
      db.run('INSERT INTO order_tracking (order_id, status) VALUES (?, ?)', [orderId, 'pending'], (err) => {
        if (err) console.error('Tracking insert:', err.message);
      });
      res.status(201).json({ id: orderId, status: 'pending', message: 'Order placed successfully' });
    }
  );
});

router.get('/orders', authenticate, (req, res) => {
  let query;
  const params = [];

  if (req.user.role === 'customer') {
    query = `SELECT o.*, u.name as supplier_name FROM orders o
      LEFT JOIN users u ON o.supplier_id = u.id
      WHERE o.customer_id = ? ORDER BY o.created_at DESC`;
    params.push(req.user.id);
  } else if (req.user.role === 'supplier') {
    query = `SELECT o.*, u.name as customer_name, u.phone as customer_phone
      FROM orders o JOIN users u ON o.customer_id = u.id
      WHERE o.supplier_id = ? ORDER BY o.created_at DESC`;
    params.push(req.user.id);
  } else if (req.user.role === 'waterman') {
    query = `SELECT o.*, u.name as customer_name, u.phone as customer_phone, s.station_name
      FROM orders o JOIN users u ON o.customer_id = u.id
      LEFT JOIN suppliers s ON o.supplier_id = s.user_id
      WHERE o.waterman_id = ? ORDER BY o.created_at DESC`;
    params.push(req.user.id);
  } else {
    query = `SELECT o.*, c.name as customer_name, s.name as supplier_name, w.name as waterman_name
      FROM orders o
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN users s ON o.supplier_id = s.id
      LEFT JOIN users w ON o.waterman_id = w.id
      ORDER BY o.created_at DESC`;
  }

  db.all(query, params, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
});

router.get('/orders/available', authenticate, (req, res) => {
  if (req.user.role !== 'waterman' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only watermen can view available orders.' });
  }

  db.all(`SELECT o.*, u.name as customer_name, u.phone as customer_phone, u.location as customer_location,
    s.station_name, sup.name as supplier_name
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN suppliers s ON o.supplier_id = s.user_id
    LEFT JOIN users sup ON o.supplier_id = sup.id
    WHERE o.status = 'accepted' AND o.waterman_id IS NULL
    ORDER BY o.created_at DESC`, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
});

router.get('/orders/:id', authenticate, (req, res) => {
  db.get(`SELECT o.*, c.name as customer_name, s.name as supplier_name, w.name as waterman_name
    FROM orders o
    LEFT JOIN users c ON o.customer_id = c.id
    LEFT JOIN users s ON o.supplier_id = s.id
    LEFT JOIN users w ON o.waterman_id = w.id
    WHERE o.id = ?`, [req.params.id], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  });
});

router.get('/orders/:id/tracking', authenticate, (req, res) => {
  db.all('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC',
    [req.params.id], (err, tracking) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(tracking);
    });
});

router.put('/orders/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['accepted', 'rejected', 'assigned', 'in_transit', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (status === 'cancelled' && req.user.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own orders.' });
    }
    if (status === 'cancelled' && req.user.role !== 'customer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only customers or admins can cancel orders.' });
    }
    if ((status === 'accepted' || status === 'rejected') && req.user.role !== 'supplier' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only suppliers can accept or reject orders.' });
    }

    let updateSQL = "UPDATE orders SET status=?, updated_at=datetime('now')";
    const params = [status];

    if (status === 'accepted' && req.user.role === 'supplier') {
      updateSQL += ', supplier_id=COALESCE(supplier_id, ?)';
      params.push(req.user.id);
    }

    if (status === 'assigned' && req.user.role === 'waterman') {
      updateSQL += ', waterman_id=?';
      params.push(req.user.id);
    }

    params.push(req.params.id);

    db.run(updateSQL + ' WHERE id=?', params, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      let notes = null;
      if (req.user.role === 'waterman') notes = `Accepted by ${req.user.name}`;
      else if (req.user.role === 'admin') notes = `Admin set status to ${status}`;
      db.run('INSERT INTO order_tracking (order_id, status, notes) VALUES (?, ?, ?)',
        [req.params.id, status, req.user.role === 'waterman' ? `Accepted by ${req.user.name}` : null],
        (err2) => { if (err2) console.error('Tracking:', err2.message); });
      res.json({ message: `Order ${status} successfully` });
    });
  });
});

router.get('/watermen/available', authenticate, (req, res) => {
  db.all(`SELECT u.id, u.name, u.phone, w.vehicle, w.district, w.rating
    FROM users u JOIN watermen w ON u.id = w.user_id WHERE w.is_available = 1`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/dashboard/stats', authenticate, (req, res) => {
  if (req.user.role === 'customer') {
    db.get(`SELECT COUNT(*) as total,
      SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) as delivered,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders WHERE customer_id=?`, [req.user.id], (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats);
    });
  } else if (req.user.role === 'supplier') {
    db.get(`SELECT COUNT(*) as total,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) as delivered
      FROM orders WHERE supplier_id=?`, [req.user.id], (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats);
    });
  } else if (req.user.role === 'waterman') {
    db.get(`SELECT COUNT(*) as total,
      SUM(CASE WHEN status='in_transit' THEN 1 ELSE 0 END) as in_transit,
      SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) as delivered
      FROM orders WHERE waterman_id=?`, [req.user.id], (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats);
    });
  } else {
    db.get(`SELECT COUNT(*) as total_orders,
      (SELECT COUNT(*) FROM users WHERE role='customer') as customers,
      (SELECT COUNT(*) FROM users WHERE role='supplier') as suppliers,
      (SELECT COUNT(*) FROM users WHERE role='waterman') as watermen
      FROM orders`, (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats);
    });
  }
});

// ===== Admin endpoints =====

router.get('/admin/users', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  db.all(`SELECT id, name, email, phone, role, location, created_at FROM users ORDER BY role, name`, (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

router.get('/admin/activities', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  db.all(`SELECT ot.*, o.customer_id, o.supplier_id, o.waterman_id
    FROM order_tracking ot JOIN orders o ON ot.order_id = o.id
    ORDER BY ot.created_at DESC LIMIT 50`, (err, activities) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(activities);
  });
});

router.put('/admin/orders/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  const { water_type, quantity, address, district, phone, notes } = req.body;
  const safe = (v) => v === undefined ? null : v;
  db.run(`UPDATE orders SET
    water_type=COALESCE(?,water_type), quantity=COALESCE(?,quantity),
    address=COALESCE(?,address), district=COALESCE(?,district),
    phone=COALESCE(?,phone), notes=COALESCE(?,notes),
    updated_at=datetime('now') WHERE id=?`,
    [safe(water_type), safe(quantity), safe(address), safe(district), safe(phone), safe(notes), req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run('INSERT INTO order_tracking (order_id, status, notes) VALUES (?,?,?)',
        [req.params.id, 'updated', 'Admin updated order details'], (e) => { if (e) console.error(e.message); });
      res.json({ message: 'Order updated successfully' });
    });
});

router.put('/admin/orders/:id/reassign', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  const { supplier_id, waterman_id } = req.body;
  let sql = "UPDATE orders SET updated_at=datetime('now')";
  const params = [];
  if (supplier_id !== undefined) { sql += ', supplier_id=?'; params.push(supplier_id); }
  if (waterman_id !== undefined) { sql += ', waterman_id=?'; params.push(waterman_id); }
  params.push(req.params.id);
  db.run(sql + ' WHERE id=?', params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const reassignNotes = [];
    if (supplier_id !== undefined) reassignNotes.push('supplier reassigned');
    if (waterman_id !== undefined) reassignNotes.push('waterman reassigned');
    db.run('INSERT INTO order_tracking (order_id, status, notes) VALUES (?,?,?)',
      [req.params.id, 'reassigned', reassignNotes.join(', ')], (e) => { if (e) console.error(e.message); });
    res.json({ message: 'Order reassigned successfully' });
  });
});

module.exports = router;
