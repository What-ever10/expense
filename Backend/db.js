const Database = require("better-sqlite3");

const db = new Database("expenses.db");

db.exec(`
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  description TEXT CHECK(length(description) <= 255),
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  idempotency_key TEXT UNIQUE
);
`);


module.exports = db;
