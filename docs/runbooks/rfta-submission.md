# Runbook: RFTA Submission

## Purpose
Walk through submitting a Request for Tenancy Approval (RFTA) to the PHA after identifying a Section 8 voucher holder.

## Prerequisites
- Deal is in `due_diligence` or `financing` stage
- NSPIRE self-audit score ≥ 60
- Tenant has valid voucher
- Voucher bedroom size matches unit

## Steps

### 1. Collect Tenant Documents
- [ ] Valid Housing Choice Voucher (copy)
- [ ] Government-issued ID
- [ ] Completed RFTA packet from PHA website
- [ ] Rental application (screening)

### 2. Confirm Payment Standard
- Check PHA's current payment standard for bedroom size
- Verify your requested contract rent is at or below payment standard
  - Contract rent > payment standard = tenant pays difference
  - Target: contract rent ≤ payment standard

### 3. Complete RFTA Form
Required fields (vary by PHA):
- Property address
- Unit number (if multi-unit)
- Bedroom size
- Requested contract rent
- Utility responsibility (landlord vs. tenant)
- Landlord name, EIN/SSN, bank info for HAP

### 4. Submit RFTA
- Email or portal upload to PHA (see PHA contact in dashboard)
- Note submission date in Supabase:
  ```sql
  insert into rfta_submissions (deal_id, tenant_id, pha_id, submitted_at)
  values ('<deal_id>', '<tenant_id>', '<pha_id>', now());
  ```

### 5. Set Compliance Deadlines
```sql
insert into compliance_deadlines (deal_id, deadline_type, due_date, notes) values
  ('<deal_id>', 'rta_submission', current_date, 'RFTA submitted to CMHA'),
  ('<deal_id>', 'hap_execution', current_date + 60, 'Expected 30-60 day HAP execution');
```

### 6. Schedule NSPIRE Inspection
- PHA will schedule inspection after RFTA received
- Timeline: 1–4 weeks (PHA-dependent)
- Ensure property is ready per [nspire-prep.md](./nspire-prep.md)

### 7. After Inspection Passes
- PHA issues HAP contract
- Sign and return within deadline (typically 10 days)
- Note acceptance date in Supabase:
  ```sql
  update rfta_submissions set accepted_at = now() where id = '<rfta_id>';
  update tenants set voucher_status = 'hap_contract' where id = '<tenant_id>';
  ```

### 8. Execute HAP Contract
- HAP contract specifies:
  - Contract rent (total)
  - HAP payment (PHA portion)
  - Tenant portion (if any)
  - Effective date
  - Initial term (1 year, renewable)

## Common Issues

| Issue | Resolution |
|---|---|
| PHA rejects rent as too high | Negotiate with seller or accept lower rent |
| Inspection fails | Remediate items; request re-inspection |
| Tenant loses voucher | Start tenant search; update deal status |
| HAP contract delayed | Follow up weekly with PHA contact |

## PHA Contact Sheet

See Supabase → phas table or Dashboard → Lenders (filter PHA).
