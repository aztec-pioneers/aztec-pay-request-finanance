import { Database } from "bun:sqlite";

const db = new Database("invoices.db", { create: true });

db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA foreign_keys = ON");

db.run(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),

    -- Dates
    issued_date TEXT NOT NULL,
    due_date TEXT NOT NULL,

    -- From (sender)
    from_name TEXT NOT NULL,
    from_address TEXT,
    from_email TEXT,

    -- Client (billed to)
    client_name TEXT,
    client_email TEXT,

    -- Payment details
    invoice_currency TEXT NOT NULL DEFAULT 'USD',
    invoice_type TEXT NOT NULL DEFAULT 'regular',
    payment_method TEXT NOT NULL DEFAULT 'crypto',
    payment_network TEXT,
    payment_currency TEXT,
    wallet_address TEXT,

    -- Totals
    amount_without_tax REAL NOT NULL DEFAULT 0,
    total_tax REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,

    -- Optional
    memo TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    description TEXT,
    qty REAL NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    tax_percent REAL NOT NULL DEFAULT 0,
    amount REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  )
`);

export default db;
