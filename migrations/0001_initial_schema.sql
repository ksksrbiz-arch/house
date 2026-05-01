-- Cathedral Acquisitions: Initial Schema (Cloudflare D1 / SQLite)

-- ─── Reference Tables ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS states (
  code TEXT PRIMARY KEY CHECK(length(code) = 2),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS phas (
  id   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  state TEXT REFERENCES states(code),
  contact_email       TEXT,
  contact_phone       TEXT,
  avg_days_rta_to_hap INTEGER DEFAULT 45,
  payment_standard_2br REAL DEFAULT 0,
  notes      TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lenders (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name         TEXT NOT NULL,
  loan_type    TEXT NOT NULL CHECK (loan_type IN ('FHA','DSCR','Conventional','Portfolio','Hard Money')),
  min_ltv      REAL DEFAULT 0,
  max_ltv      REAL DEFAULT 97,
  rate_floor   REAL DEFAULT 0,
  rate_ceiling REAL DEFAULT 20,
  min_dscr     REAL,
  min_fico     INTEGER DEFAULT 620,
  states       TEXT DEFAULT '[]',   -- JSON array of state codes
  notes        TEXT,
  last_updated TEXT DEFAULT (date('now'))
);

-- ─── Core Deal Tables ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deals (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  address      TEXT NOT NULL,
  city         TEXT NOT NULL,
  state        TEXT REFERENCES states(code),
  zip          TEXT,
  asking_price REAL DEFAULT 0,
  units        INTEGER DEFAULT 1,
  stage        TEXT NOT NULL DEFAULT 'prospecting'
               CHECK (stage IN ('prospecting','under_contract','due_diligence','financing','closing','closed','dead')),
  pha_id       TEXT REFERENCES phas(id),
  assigned_to  TEXT,
  notes        TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deal_financials (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id             TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  purchase_price      REAL,
  rehab_cost          REAL DEFAULT 0,
  down_payment_pct    REAL DEFAULT 3.5,
  interest_rate       REAL DEFAULT 7.25,
  term_years          INTEGER DEFAULT 30,
  gross_monthly_rent  REAL DEFAULT 0,
  vacancy_pct         REAL DEFAULT 5,
  expense_pct         REAL DEFAULT 40,
  loan_type           TEXT DEFAULT 'FHA',
  lender_id           TEXT REFERENCES lenders(id),
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deal_documents (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id     TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  doc_type    TEXT,
  storage_key TEXT NOT NULL,
  uploaded_by TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ─── Inspections ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inspections (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id          TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  inspection_date  TEXT,
  inspector_name   TEXT,
  score            INTEGER CHECK (score BETWEEN 0 AND 100),
  passed           INTEGER DEFAULT 0,   -- 0=false, 1=true
  checklist        TEXT DEFAULT '[]',    -- JSON array
  notes            TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);

-- ─── Tenants / Vouchers ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id         TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  voucher_number  TEXT,
  pha_id          TEXT REFERENCES phas(id),
  bedroom_size    INTEGER DEFAULT 2,
  voucher_status  TEXT NOT NULL DEFAULT 'referred'
                  CHECK (voucher_status IN ('referred','screening','approved','rta_submitted','hap_contract','housed','rejected')),
  move_in_date    TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hap_contracts (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id         TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  tenant_id       TEXT REFERENCES tenants(id),
  pha_id          TEXT REFERENCES phas(id),
  unit_number     TEXT,
  bedroom_size    INTEGER,
  contract_rent   REAL,
  hap_payment     REAL,
  tenant_portion  REAL,
  effective_date  TEXT,
  expiration_date TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── Compliance ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_deadlines (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id        TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deadline_type  TEXT NOT NULL
                 CHECK (deadline_type IN ('inspection_schedule','rta_submission','hap_execution','lead_disclosure','closing','rent_increase','annual_recert','mip_cancellation')),
  due_date       TEXT NOT NULL,
  completed_at   TEXT,
  notes          TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rfta_submissions (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id          TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  tenant_id        TEXT REFERENCES tenants(id),
  pha_id           TEXT REFERENCES phas(id),
  submitted_at     TEXT,
  accepted_at      TEXT,
  rejection_reason TEXT,
  notes            TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);

-- ─── Market ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS market_listings (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  address      TEXT NOT NULL,
  city         TEXT NOT NULL,
  state        TEXT REFERENCES states(code),
  asking_price REAL DEFAULT 0,
  units        INTEGER DEFAULT 1,
  gross_rent   REAL DEFAULT 0,
  grm          REAL DEFAULT 0,
  score        INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  flagged      INTEGER DEFAULT 0,
  source       TEXT DEFAULT 'manual',
  raw_data     TEXT DEFAULT '{}',   -- JSON object
  listed_at    TEXT DEFAULT (date('now')),
  created_at   TEXT DEFAULT (datetime('now'))
);

-- ─── Finances ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS financial_snapshots (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id       TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  snapshot_date TEXT NOT NULL DEFAULT (date('now')),
  noi           REAL,
  dscr          REAL,
  cashflow      REAL,
  cap_rate      REAL,
  coc_return    REAL,
  total_debt    REAL,
  equity        REAL,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ─── Logs ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  table_name   TEXT NOT NULL,
  row_id       TEXT NOT NULL,
  action       TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data     TEXT,   -- JSON
  new_data     TEXT,   -- JSON
  performed_by TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- ─── Unique constraints for upserts ───────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS market_listings_address_city_state
  ON market_listings(address, city, state);

CREATE UNIQUE INDEX IF NOT EXISTS financial_snapshots_deal_date
  ON financial_snapshots(deal_id, snapshot_date);
