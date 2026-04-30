# Cathedral Acquisitions — Architecture

## Overview

Cathedral Acquisitions is a **Section 8 acquisition pipeline** — a full-stack system for finding, underwriting, and managing HUD-assisted rental properties.

## Stack

| Layer | Technology |
|---|---|
| Dashboard | React 19 + Vite + Tailwind CSS |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (magic link — v2 task) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Hosting | Netlify (CDN + CI/CD) |
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

## Database Schema (17 tables)

### Reference
- `states` — 11 states
- `phas` — Public Housing Authorities (7 seeded)
- `lenders` — Lender database (14 seeded, April 2026 pricing)

### Core
- `deals` — Deal pipeline (stages: prospecting → closed)
- `deal_financials` — Financial inputs per deal
- `deal_documents` — Uploaded documents (storage key)

### Operations
- `inspections` — NSPIRE inspection records + checklists (JSONB)
- `tenants` — Voucher holder pipeline
- `hap_contracts` — HAP contract details
- `compliance_deadlines` — Calendar of required actions
- `rfta_submissions` — Request for Tenancy Approval tracking
- `market_listings` — Scanner output

### Analytics
- `financial_snapshots` — Weekly recalculated financials
- `audit_log` — Change history

## Views (3)

- `pipeline_summary` — Stage counts and totals
- `overdue_deadlines` — Deadlines past due date
- `voucher_pipeline` — Active voucher holders
- `deal_snapshot` — Deals joined with latest financial snapshot

## Functions (2)

- `complete_deadline(uuid)` — Mark a deadline complete
- `calc_noi(uuid)` — Compute NOI for a deal

## Architecture Decisions

### Postgres-First
Every read is a view query. Every write is a row insert/update. No ORM. Direct `supabase-js`.

### Brand
Navy / Teal / Gold. Tailwind config has full palette under `cathedral.{navy,teal,gold}`.

### RLS
Permissive single-tenant now. Replace `to authenticated using (true)` with per-user checks when portfolio partners join:
```sql
using (auth.uid() in (select user_id from members where deal_id = deals.id))
```

### No Auth Yet
Dashboard assumes you're authenticated. Add Supabase magic-link auth as v2 task.

### Tests Live Next to Code
`packages/calculations/tests/` not `__tests__`. Vitest, not Jest.

## Cathedral Principle

**Foundation → Revenue → Systems → Scale**

- Foundation = the schema. Truth lives there.
- Revenue = the math + the pipeline. Every dollar tracked.
- Systems = the workflows. Daily/weekly automation.
- Scale = RLS-ready, LLC-ready, Series-LLC-ready at 5+ doors.
