-- SQLite version of database/schema.sql, used only by the automated tests.
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
  full_name TEXT NOT NULL, company TEXT, email TEXT NOT NULL, phone TEXT, service TEXT, team_size TEXT,
  message TEXT NOT NULL, consent INTEGER NOT NULL DEFAULT 0, consent_text TEXT, source_page TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_term TEXT, utm_content TEXT,
  ip_hash TEXT, user_agent TEXT, notified_at TEXT, crm_status TEXT NOT NULL DEFAULT 'pending',
  crm_id TEXT, crm_synced_at TEXT, crm_error TEXT
);
CREATE TABLE lead_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL, outcome TEXT NOT NULL
);
