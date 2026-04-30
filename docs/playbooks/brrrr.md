# Playbook: BRRRR (Buy-Rehab-Rent-Refinance-Repeat)

## Overview
Buy distressed, rehab to NSPIRE standards, place Section 8 tenant, refinance out most of your capital, repeat. Each cycle builds equity and cashflow with recycled capital.

## The Math That Makes BRRRR Work

```typescript
import { calcCapitalStack, calcCashflow, calcMortgage } from '@cathedral/calculations';

// Buy + Rehab
const buy = calcCapitalStack({
  purchasePrice: 80_000,
  rehabCost: 30_000,
  closingCostsPct: 3,
  downPaymentPct: 100, // cash purchase
});
// All-in: $80k + $30k + $2.4k closing = $112.4k

// After ARV refi at 75% LTV on $150k ARV
const refiLoan = 150_000 * 0.75; // $112.5k
// Pull out: $112.5k - $112.4k = ~$100 (near full capital recovery)

// Monthly payment on refi
const { monthlyPayment } = calcMortgage({
  principal: refiLoan,
  annualRatePct: 7.5,
  termYears: 30,
});

// Cashflow check
const cf = calcCashflow({
  grossRent: 1_400,
  vacancyRatePct: 5,
  operatingExpensePct: 40,
  monthlyDebtService: monthlyPayment,
  purchasePrice: 150_000,
  downPaymentAmt: 150_000 * 0.25,
});
// cashflow: ~$40/mo; equity: $37.5k locked in ARV
```

## Step-by-Step

### 1. Find the Property
- Target: 30–50% below ARV distressed single-family or small multifamily
- Off-market preferred: driving for dollars, probate, wholesalers
- Run repair estimate immediately

### 2. Purchase (Cash or Hard Money)
- Cash: fastest close, best price
- Hard Money: 70% LTV on ARV, 10–14% rate, 12–18 month term
- Hard money timeline: submit deal to Lima One or RCN Capital same day

### 3. Rehab to NSPIRE Standards
- Use NSPIRE checklist as your scope of work guide
- Priority: life_threatening → severe → moderate → low
- Document everything with photos for:
  - Insurance
  - Appraisal (comps)
  - Lead paint compliance

### 4. Tenant Placement (Section 8)
- Submit property to PHA once rehab complete
- RFTA → inspection → HAP contract
- Lock in guaranteed rent before refinance

### 5. Refinance (DSCR or Conventional)
- After HAP contract in hand, lender will use contract rent as income
- DSCR: no income verification, closes in 30 days
- Target: 75% LTV on ARV → pull back initial capital

### 6. Repeat
- Recycled capital goes into next deal
- Each property cash-flows while building equity

## NSPIRE Rehab Checklist Priority

When rehabbing specifically for NSPIRE pass:
1. ✅ Smoke + CO detectors in every unit and common area (cheap, easy, required)
2. ✅ Electrical panel clean (no double-taps, proper breakers)
3. ✅ HVAC operational
4. ✅ All plumbing functional, no leaks
5. ✅ No peeling paint (pre-1978: lead protocol)
6. ✅ All windows operational and lockable
7. ✅ Entry doors lock and are weathertight
8. ✅ No evidence of rodents/pests

## Risk Controls
- Never close without a detailed scope of work
- Hard money = time pressure — plan rehab before closing
- BRRRR math only works if ARV > All-In by 25%+
- Section 8 inspection adds 4–6 weeks after rehab complete; factor into hard money timeline
