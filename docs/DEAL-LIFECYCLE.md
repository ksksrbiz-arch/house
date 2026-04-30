# Deal Lifecycle — Cathedral Acquisitions

## Stages

```
prospecting → under_contract → due_diligence → financing → closing → closed
                                                                    ↘ dead
```

## Stage Definitions

### 1. Prospecting
- Property identified via market scanner or manual search
- Initial underwriting run (GRM, cap rate, DSCR estimate)
- Action: Create deal via GitHub Issue or `pnpm deal:new`

### 2. Under Contract
- Purchase agreement signed
- Earnest money deposited
- Action: Upload signed contract to `deal_documents`; set compliance deadlines

### 3. Due Diligence
- NSPIRE self-audit via Inspections page
- Repair estimate finalized
- Title search ordered
- Lead disclosure served (if pre-1978)
- Action: Complete inspection checklist; add all compliance deadlines

### 4. Financing
- Loan application submitted
- Appraisal ordered
- FHA/DSCR underwriting
- Action: Create lender application issue; track in Lenders page

### 5. Closing
- Loan clear-to-close
- HAP contract application submitted to PHA
- Final walkthrough
- Action: Confirm all compliance deadlines met

### 6. Closed
- Title transferred
- HAP contract executed
- Tenant moved in (if applicable)
- Action: Update financial snapshot; begin annual recert tracking

### Dead
- Deal fell through at any stage
- Action: Note reason; archive deal

## Key Timelines

| Milestone | Target Timeline |
|---|---|
| Earnest money to inspection | 5–10 days |
| Inspection to repair estimate | 3–5 days |
| Loan application to clear-to-close | 30–45 days (FHA) |
| RTA submission to HAP contract | 30–90 days (PHA-dependent) |
| Lead disclosure service | Before contract signing for pre-1978 |

## Compliance Deadlines to Set at Contract

1. `lead_disclosure` — Day 0 (or before)
2. `inspection_schedule` — Within 10 days of contract
3. `rta_submission` — Within 30 days of closing
4. `hap_execution` — 60–90 days post-RTA (PHA-specific)
5. `closing` — Per purchase agreement
