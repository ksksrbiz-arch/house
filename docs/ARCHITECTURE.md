# Cathedral Acquisitions — Architecture

## Overview

Cathedral Acquisitions is a **Section 8 acquisition pipeline** — a full-stack system for finding, underwriting, and managing HUD-assisted rental properties.

## Stack

| Layer | Technology |
|---|---|
| Dashboard | React 19 + Vite + Tailwind CSS |
| Database | Cloudflare D1 (SQLite) |
| API | Cloudflare Pages Functions (TypeScript) |
| Hosting | Cloudflare Pages |
| Monorepo | pnpm workspaces |
| Tests | Vitest |
| CI/CD | GitHub Actions |

## Packages

```
cathedral-acquisitions/
├── apps/dashboard/          React app (9 pages)
├── packages/calculations/   Pure-function math (38 tests)
├── packages/nspire-engine/  NSPIRE checklist engine (12 tests)
└── packages/shared-types/   Domain TypeScript types
```

## Database Schema (14 tables)

### Reference
- `states` — 11 states
- `phas` — Public Housing Authorities (7 seeded)
- `lenders` — Lender database (14 seeded, April 2026 pricing)

### Core
- `deals` — Deal pipeline (stages: prospecting → closed)
- `deal_financials` — Financial inputs per deal
- `deal_documents` — Uploaded documents (storage key)

### Operations
- `inspections` — NSPIRE inspection records + checklists (JSON)
- `tenants` — Voucher holder pipeline
- `hap_contracts` — HAP contract details
- `compliance_deadlines` — Calendar of required actions
- `rfta_submissions` — Request for Tenancy Approval tracking
- `market_listings` — Scanner output

### Analytics
- `financial_snapshots` — Weekly recalculated financials
- `audit_log` — Change history

## API Routes (Cloudflare Pages Functions)

| Route | Methods | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/deals` | GET, POST | List/upsert deals |
| `/api/tenants` | GET | List tenants |
| `/api/inspections` | GET | List inspections |
| `/api/deadlines` | GET | List compliance deadlines |
| `/api/listings` | GET | List market listings |
| `/api/lenders` | GET | List lenders |
| `/api/phas` | GET | List PHAs |
| `/api/documents` | GET, POST, DELETE | Manage documents |
| `/api/portfolio` | GET | Portfolio aggregation |
| `/api/deadline-watcher` | POST | Check overdue deadlines, post GitHub issues |
| `/api/market-scan` | POST | Scan and score market listings |
| `/api/financial-recalc` | POST | Recalculate deal financials |
| `/api/nspire-audit` | POST | Process NSPIRE inspection audit |

## Architecture Decisions

### D1-First (SQLite)
Every read is a SQL query via D1 bindings. Every write is a row insert/update. No ORM. Direct SQL via Pages Functions.

### Brand
Navy / Teal / Gold. Tailwind config has full palette under `cathedral.{navy,teal,gold}`.

### No Auth Yet
Dashboard assumes you're authenticated. Add Cloudflare Access or custom auth as v2 task.

### Tests Live Next to Code
`packages/calculations/tests/` not `__tests__`. Vitest, not Jest.

## Cathedral Principle

**Foundation → Revenue → Systems → Scale**

- Foundation = the schema. Truth lives there.
- Revenue = the math + the pipeline. Every dollar tracked.
- Systems = the workflows. Daily/weekly automation.
- Scale = Multi-tenant ready at 5+ doors.
