# Cathedral Acquisitions

A complete, runnable **Section 8 acquisition pipeline** — find, underwrite, and manage HUD-assisted rental properties.

## What's Inside

- **82 files** · 76 passing tests (63 calc + 13 NSPIRE)
- **Schema**: 17 tables, 3 views, 2 functions, RLS policies, seeded reference data
- **9 React pages**: navy/teal/gold brand dashboard
- **5 GitHub Actions workflows**: CI, deploy, daily deadlines, weekly recalc, market scanner
- **4 Supabase Edge Functions**: deadline-watcher, market-scan, nspire-audit, financial-recalc
- **4 issue templates**: deal, lender, inspection, tenant
- **12 docs files**: architecture, lifecycle, 3 playbooks, 3 runbooks, 4 templates

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Verify tests pass
pnpm test
# Expected: 76/76 passing

# 3. Copy env and fill in Supabase credentials
cp .env.example .env

# 4. Set up Supabase (one-time)
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase db push

# 5. Deploy edge functions
for fn in deadline-watcher market-scan nspire-audit financial-recalc; do
  supabase functions deploy $fn
done

# 6. Run dashboard
pnpm dev
# Opens http://localhost:5173
```

## GitHub Secrets

In repo Settings → Secrets and variables → Actions:

| Secret | Where |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Same place |
| `SUPABASE_URL` | Same as VITE_SUPABASE_URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → Project API keys |
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Supabase → Settings → Database |
| `SUPABASE_PROJECT_ID` | From your project URL |
| `NETLIFY_AUTH_TOKEN` | Netlify → User settings → Applications |
| `NETLIFY_SITE_ID` | Netlify → Site settings |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens (Pages: Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Workers & Pages → Account ID |

## Deploy to Cloudflare Pages

The dashboard deploys to Cloudflare Pages on every push to `main` via
`.github/workflows/deploy-cloudflare.yml`.

**One-time setup:**

1. Create a Pages project named `cathedral-acquisitions` (Workers & Pages →
   Create → Pages → Direct Upload).
2. Create an API token with the **Cloudflare Pages: Edit** template.
3. Add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`,
   and `VITE_SUPABASE_ANON_KEY` to GitHub Actions secrets.
4. In Pages → Settings → Environment variables, mirror the `VITE_SUPABASE_*`
   vars so preview deployments can reach Supabase.

**Manual deploy:**

```bash
pnpm install
pnpm deploy:cloudflare   # builds, then runs `wrangler pages deploy`
```

**Layout:**

- `wrangler.toml` — Pages output dir (`apps/dashboard/dist`).
- `apps/dashboard/public/_redirects` — SPA fallback to `/index.html`.
- `apps/dashboard/public/_headers` — security headers + asset caching.
- `functions/api/health.ts` — Pages Function exposed at `/api/health`.

Optional: `MAILERLITE_API_KEY`, `NOTIFY_EMAIL`, `ZILLOW_API_KEY`

## Package Structure

```
cathedral-acquisitions/
├── apps/dashboard/          React 19 + Vite + Tailwind (9 pages)
├── packages/calculations/   Pure-function math (63 tests)
├── packages/nspire-engine/  49-item NSPIRE checklist (13 tests)
├── packages/shared-types/   Domain TypeScript types
├── supabase/
│   ├── migrations/          4 SQL files (schema, RLS, views, seed)
│   └── functions/           4 Deno edge functions
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
- Scale = RLS-ready, LLC-ready, Series-LLC-ready at 5+ doors.