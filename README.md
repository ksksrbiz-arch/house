# Cathedral Acquisitions

A complete, runnable **Section 8 acquisition pipeline** — find, underwrite, and manage HUD-assisted rental properties.

## What's Inside

- **82 files** · 76 passing tests (63 calc + 13 NSPIRE)
- **Schema**: 14 tables, D1 migrations, seeded reference data
- **9 React pages**: navy/teal/gold brand dashboard
- **5 GitHub Actions workflows**: CI, deploy, daily deadlines, weekly recalc, market scanner
- **12 Cloudflare Pages Functions**: CRUD API + 4 automation workers
- **4 issue templates**: deal, lender, inspection, tenant
- **12 docs files**: architecture, lifecycle, 3 playbooks, 3 runbooks, 4 templates

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Verify tests pass
pnpm test
# Expected: 76/76 passing

# 3. Copy env and fill in Cloudflare credentials
cp .env.example .env

# 4. Create D1 database (one-time)
wrangler d1 create cathedral-acquisitions-db
# Copy the database_id into wrangler.toml

# 5. Apply migrations
wrangler d1 migrations apply cathedral-acquisitions-db --local   # local dev
wrangler d1 migrations apply cathedral-acquisitions-db --remote  # production

# 6. Run dashboard (with local D1)
pnpm dev
# Opens http://localhost:5173
```

## GitHub Secrets

In repo Settings → Secrets and variables → Actions:

| Secret | Where |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens (Pages + D1: Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Workers & Pages → Account ID |
| `WORKER_URL` | Your Pages URL (e.g. `https://cathedral-acquisitions.pages.dev`) |

Optional: `MAILERLITE_API_KEY`, `NOTIFY_EMAIL`, `ZILLOW_API_KEY`, `GITHUB_TOKEN`

## Deploy to Cloudflare Pages

The dashboard + API deploy to Cloudflare Pages on every push to `main` via
`.github/workflows/deploy-cloudflare.yml`. D1 migrations are applied automatically.

**One-time setup:**

1. Create a D1 database: `wrangler d1 create cathedral-acquisitions-db`
2. Update `database_id` in `wrangler.toml`
3. Create a Pages project named `cathedral-acquisitions` (Workers & Pages →
   Create → Pages → Direct Upload).
4. Create an API token with **Cloudflare Pages: Edit** + **D1: Edit** permissions.
5. Add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `WORKER_URL` to
   GitHub Actions secrets.

**Manual deploy:**

```bash
pnpm install
pnpm deploy:cloudflare   # builds, then runs `wrangler pages deploy`
```

**Layout:**

- `wrangler.toml` — Pages output dir + D1 binding.
- `migrations/` — D1 SQL migration files.
- `functions/api/` — Cloudflare Pages Functions (API routes).
- `apps/dashboard/public/_redirects` — SPA fallback to `/index.html`.
- `apps/dashboard/public/_headers` — security headers + asset caching.

## Package Structure

```
cathedral-acquisitions/
├── apps/dashboard/          React 19 + Vite + Tailwind (9 pages)
├── packages/calculations/   Pure-function math (63 tests)
├── packages/nspire-engine/  49-item NSPIRE checklist (13 tests)
├── packages/shared-types/   Domain TypeScript types
├── migrations/              D1 SQL migration files
├── functions/api/           Cloudflare Pages Functions (API)
├── .github/
│   ├── workflows/           5 GitHub Actions workflows
│   └── ISSUE_TEMPLATE/      4 issue templates
├── scripts/                 4 automation scripts
└── docs/                    Architecture, playbooks, runbooks, templates
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

**Cathedral Principle: Foundation → Revenue → Systems → Scale**
- Foundation = the schema. Truth lives there.
- Revenue = the math + the pipeline. Every dollar tracked.
- Systems = the workflows. Daily/weekly automation.
- Scale = Multi-tenant ready at 5+ doors.