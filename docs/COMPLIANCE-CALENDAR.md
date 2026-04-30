# Compliance Calendar — Cathedral Acquisitions

## Annual Recurring Items (per property)

| Item | Due | Notes |
|---|---|---|
| Annual NSPIRE / HQS inspection | Annually | PHA schedules; prepare 30 days prior |
| HAP contract renewal | Annually | Auto-renews in most PHAs; confirm |
| Tenant annual recertification | Annually | PHA-initiated; tenant submits income docs |
| Lead paint annual disclosure | Annually (pre-1978 only) | Required per 24 CFR 35 |
| Smoke/CO detector inspection | Annually | Self-audit before PHA inspection |
| MIP cancellation check | Year 11 | FHA MIP drops if LTV ≤ 78% |
| Rent increase request | Annually | Submit to PHA 60 days before HAP renewal |

## Deal-Level Milestones

| Item | When |
|---|---|
| Lead disclosure | Day 0 — before/at contract signing |
| Inspection schedule | Within 10 days of contract |
| Earnest money | Per contract (usually 1–3 days) |
| RTA submission | When tenant identified |
| HAP contract execution | 30–90 days after RTA (PHA-dependent) |
| Closing | Per purchase agreement |

## PHA-Specific Timelines

| PHA | Avg RTA → HAP |
|---|---|
| CMHA (Cleveland) | 30 days |
| Indianapolis HA | 35 days |
| Memphis HA | 40 days |
| Atlanta Housing | 50 days |
| Philadelphia HA | 60 days |
| Detroit HC | 45 days |
| CHA (Chicago) | 90 days |

## Automated Checks

The `daily-deadlines.yml` workflow runs at 09:00 UTC and:
1. Queries the `overdue_deadlines` view
2. Creates a GitHub Issue for each item overdue

The `weekly-recalc.yml` workflow runs Sunday 13:00 UTC and:
1. Recalculates financials for all active deals
2. Stores results in `financial_snapshots`

## Statute References

- **24 CFR 35** — Lead-Based Paint Poisoning Prevention
- **24 CFR 982** — Section 8 Tenant-Based Assistance (HCV)
- **HUD NSPIRE Standards** — 24 CFR 5, Subpart G
- **FHA MIP Cancellation** — ML 2013-20 / ML 2023-05
