# Runbook: Tenant Screening

## Purpose
Screen Section 8 voucher holders using criteria allowed under Fair Housing Act while protecting against problematic tenancies.

## Fair Housing Notice
Section 8 / HCV status is a protected class in many jurisdictions (Ohio, Michigan, Illinois, Tennessee, and others have state-level protections). **Do not deny based solely on voucher status.** Screen based on objective criteria applied uniformly.

## Screening Criteria (Uniform, Documented)

Apply identically to all applicants:

| Criterion | Standard | Notes |
|---|---|---|
| Rental history | No evictions in last 5 years | Obtain written landlord references |
| Criminal history | No violent crimes in last 7 years | Follow HUD guidance on individualized assessment |
| Income | N/A for Section 8 | PHA verifies income; voucher covers PHA portion |
| Credit | 500+ preferred | Not a hard requirement for Section 8 |
| References | 2 landlord references | Written preferred |

## Step-by-Step

### 1. Receive Application
- Tenant submits rental application
- Collect application fee if allowed in your state (check local law)

### 2. Verify Voucher
- Request copy of current voucher from tenant
- Confirm: valid, not expired, bedroom size matches
- Contact PHA to verify voucher status if in doubt

### 3. Run Background Check
- Use a tenant screening service (TransUnion SmartMove, RentSpree, etc.)
- Obtain written consent first
- Review: credit, criminal, eviction history

### 4. Check Rental History
- Call previous 2 landlords
- Ask: Did they pay on time? Any damage? Would you rent to them again?
- Document responses in Supabase tenant notes

### 5. Make Decision
- Approve → update tenant status to `approved` in dashboard
- Deny → provide adverse action notice (required by FCRA if background check used)
  - Use neutral language; cite objective criteria
  - Do NOT cite voucher status as reason

### 6. Update Supabase
```sql
-- Approve
update tenants set voucher_status = 'approved', notes = 'Passed screening' where id = '<tenant_id>';

-- Reject
update tenants set voucher_status = 'rejected', notes = 'Prior eviction 2022' where id = '<tenant_id>';
```

### 7. Move to RFTA
Once approved, proceed to [rfta-submission.md](./rfta-submission.md).

## Documentation to Retain
- Signed rental application
- Background check consent
- Background check report
- Landlord reference notes
- Decision documentation

Retain for 3 years minimum (FCRA requirement).

## Resources
- [HUD Fair Housing guidance on criminal history](https://www.hud.gov/sites/documents/HUD_OGCGUIDAPPOFAIRHOUSINGACT_CRIMINALRECORDS.PDF)
- [FCRA adverse action requirements](https://www.ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act)
