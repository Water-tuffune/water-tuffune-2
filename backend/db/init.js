const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data.db');
const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('customer','supplier','waterman','admin')),
    location TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    station_name TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT,
    water_types TEXT DEFAULT 'Purified,Mineral,Spring',
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    supplier_id INTEGER,
    waterman_id INTEGER,
    water_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT 'litres',
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','assigned','in_transit','delivered','cancelled')),
    amount REAL,
    payment_method TEXT DEFAULT 'cash',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (supplier_id) REFERENCES users(id),
    FOREIGN KEY (waterman_id) REFERENCES users(id)
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS order_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS watermen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    vehicle TEXT,
    district TEXT,
    is_available INTEGER DEFAULT 1,
    rating REAL DEFAULT 5.0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

const db = {
  run(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    try {
      const stmt = sqlite.prepare(sql);
      const result = stmt.run(...params);
      if (callback) callback(null, { lastID: result.lastInsertRowid, changes: result.changes });
    } catch (err) {
      if (callback) callback(err);
    }
  },

  get(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    try {
      const stmt = sqlite.prepare(sql);
      const row = stmt.get(...params);
      if (callback) callback(null, row || null);
    } catch (err) {
      if (callback) callback(err);
    }
  },

  all(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    try {
      const stmt = sqlite.prepare(sql);
      const rows = stmt.all(...params);
      if (callback) callback(null, rows);
    } catch (err) {
      if (callback) callback(err);
    }
  },
};

module.exports = db;
