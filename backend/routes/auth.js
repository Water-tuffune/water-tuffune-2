const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/init');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, phone, role, location } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  if (!['customer', 'supplier', 'waterman', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (name, email, password, phone, role, location) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashed, phone || null, role, location || null],
    function (err, result) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Email already registered.' });
        return res.status(500).json({ error: err.message });
      }
      const userId = result.lastID;

      if (role === 'supplier') {
        db.run('INSERT INTO suppliers (user_id, station_name, district) VALUES (?, ?, ?)',
          [userId, `${name}'s Station`, location || 'Kampala'], (err) => {
            if (err) console.error('Supplier insert:', err.message);
          });
      }
      if (role === 'waterman') {
        db.run('INSERT INTO watermen (user_id, district) VALUES (?, ?)',
          [userId, location || 'Kampala'], (err) => {
            if (err) console.error('Waterman insert:', err.message);
          });
      }

      const token = jwt.sign(
        { id: userId, email, name, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: userId, name, email, phone, role, location },
      });
    }
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, location: user.location },
    });
  });
});

module.exports = router;
