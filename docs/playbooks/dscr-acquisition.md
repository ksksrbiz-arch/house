# Playbook: DSCR Acquisition

## Overview
Buy a cash-flowing rental using a DSCR loan — no personal income verification, no owner-occupancy requirement. Scale to unlimited properties via LLC structure.

## When to Use DSCR
- You own your primary residence already (no FHA eligibility needed)
- Property is standalone rental (not owner-occupied)
- DSCR ≥ 1.0 (ideally ≥ 1.25)
- Want to preserve DTI for other financing

## Step-by-Step

### 1. Target Properties
- 1–4 units (most DSCR lenders cap at 4-unit residential)
- Section 8 tenants preferred: guaranteed payment, reduces vacancy risk
- DSCR ≥ 1.15 at current market rents

### 2. Run DSCR
```typescript
import { calcDSCR, calcMortgage } from '@cathedral/calculations';

// $200k purchase, 25% down → $150k loan at 8% DSCR rate
const { monthlyPayment } = calcMortgage({ principal: 150_000, annualRatePct: 8, termYears: 30 });
// NOI = EGI - opex; assume $1800 gross, 5% vacancy, 40% expense
const noi = 1800 * 0.95 * 0.6 * 12; // annual
const { dscr, tier } = calcDSCR({ noi, annualDebtService: monthlyPayment * 12 });
// dscr ~1.15, tier: 'pass'
```

### 3. Choose Lender
See Lenders page — filter by DSCR. Top picks (April 2026):
- **Kiavi** — fastest, fully online, min FICO 640
- **Visio Lending** — portfolio focus, min FICO 620
- **Lima One** — bridge → hold; good for value-add

### 4. LLC Setup
- Form single-member LLC in property state
- DSCR lenders lend to LLCs (unlike FHA)
- Operating agreement required
- Obtain EIN from IRS (free, online, 5 minutes)

### 5. Apply
- Application: property address, rent roll, lease agreements
- No W2/tax returns needed
- Appraisal required (lender orders)
- Lease or market rent survey for DSCR calculation

### 6. Close in LLC
- Title vests in LLC name
- Personal guarantee typically required for small balance
- Sign closing docs as member/manager of LLC

### 7. Scale
- Refinance primary into conventional to free up DTI
- DSCR loans: no limit on number of properties
- Each property in separate LLC (Series-LLC when available in your state)

## Key Metrics to Hit

| Metric | Minimum | Target |
|---|---|---|
| DSCR | 1.0 | 1.25+ |
| LTV | — | ≤ 80% |
| FICO | 620 | 700+ |
| Cash Reserves | 3 months PITIA | 6 months |
