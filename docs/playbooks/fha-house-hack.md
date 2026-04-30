# Playbook: FHA House Hack (Cleveland Deal #1)

## Overview
Buy a 2–4 unit property with FHA 3.5% down, live in one unit, rent the others to Section 8 tenants. Minimum cash-to-close, maximum leverage.

## Step-by-Step

### 1. Find the Property
- Target: 2–4 unit in CMHA voucher acceptance area
- Criteria: Asking < $175k, GRM < 10, at least 2BR per unit
- Source: CMHA's list of accepted ZIP codes, MLS, Zillow multifamily filter

### 2. Run the Numbers
```bash
# Via dashboard: Deals → New Deal → DealDetail calculator
# Or via CLI:
pnpm tsx -e "
import { calcFHA, calcCashflow } from '@cathedral/calculations';
const fha = calcFHA({ purchasePrice: 150000, downPaymentPct: 3.5, annualRatePct: 7.25, termYears: 30 });
const cf = calcCashflow({ grossRent: 2200, vacancyRatePct: 5, operatingExpensePct: 40, monthlyDebtService: fha.monthlyPayment, purchasePrice: 150000, downPaymentAmt: 5250 });
console.log({ monthlyPayment: fha.monthlyPayment, cashflow: cf.cashflow, coc: cf.cocReturn });
"
```

### 3. Self-Sufficiency Test (3–4 units)
FHA requires: 75% × (non-owner unit rents) ≥ PITI

```typescript
import { sstPasses } from '@cathedral/calculations';
// 3 units, 2 rented at $1100/mo each → $2200 gross
// PITI estimate: $1800/mo
sstPasses(2200, 1800); // → true ✅
```

### 4. Make the Offer
- Include FHA financing contingency
- Request seller concession up to 6% (FHA max) for closing costs
- Lead paint addendum if pre-1978

### 5. Open Escrow
- Order title search
- Upload signed contract to deal_documents
- Set compliance deadlines in Supabase:
  - `lead_disclosure` → today
  - `inspection_schedule` → +10 days
  - `closing` → contract closing date

### 6. NSPIRE Self-Audit
```bash
# Dashboard → Inspections → Generate Checklist
# Walk property with checklist open
# Flag any fails → run preFailAudit
```
Required CMHA minimum score: 60. Target 80+ before scheduling.

### 7. Get FHA Appraisal
- Lender orders appraisal after clear title
- FHA appraiser checks HUD MPR (Minimum Property Requirements)
- Common fails: peeling paint (pre-1978), HVAC, roof

### 8. Apply for Section 8 HAP
- Tenant finds property via CMHA voucher search
- Tenant submits Request for Tenancy Approval (RFTA)
- CMHA schedules HQS/NSPIRE inspection
- HAP contract executed after inspection pass

### 9. Close
- Confirm all compliance deadlines completed
- Bring cashier's check for cash-to-close
- Take occupancy of one unit on closing day (FHA owner-occupancy requirement)

### 10. Post-Close
- Set up annual recert reminders (Compliance calendar)
- First financial snapshot (Finances page)
- Begin MIP cancellation tracking (year 11, LTV ≤ 78%)

## Key Numbers (Cleveland, 2026)

| Item | Estimate |
|---|---|
| Purchase | $145,000 |
| Down (3.5%) | $5,075 |
| UFMIP (1.75%) | $2,431 |
| Total Loan | $141,956 |
| Closing Costs (3%) | $4,350 |
| Cash to Close | ~$11,800 |
| Monthly P&I + MIP | ~$1,020 |
| CMHA 2BR Payment Standard | $1,050 |
| Net Monthly (owner unit free) | +$450/mo est. |
