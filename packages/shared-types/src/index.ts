// ─── Deal / Pipeline ───────────────────────────────────────────────────────

export type DealStage =
  | 'prospecting'
  | 'under_contract'
  | 'due_diligence'
  | 'financing'
  | 'closing'
  | 'closed'
  | 'dead';

export interface Deal {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  asking_price: number;
  units: number;
  stage: DealStage;
  pha_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// ─── Finance / Calculations ─────────────────────────────────────────────────

export interface MortgageInputs {
  principal: number;       // loan amount
  annualRatePct: number;   // e.g. 7.25
  termYears: number;       // e.g. 30
}

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
}

export interface FHAInputs {
  purchasePrice: number;
  downPaymentPct: number;  // e.g. 3.5
  annualRatePct: number;
  termYears: number;
  baseLoanAmount?: number; // if different from purchasePrice * (1 - downPct)
}

export interface FHAResult {
  baseLoanAmount: number;
  ufmip: number;           // upfront MIP amount
  totalLoanAmount: number; // base + ufmip
  monthlyMIP: number;
  monthlyPayment: number;  // P&I + MIP
  ltv: number;
}

export interface DSCRInputs {
  noi: number;             // net operating income (annual)
  annualDebtService: number;
}

export interface DSCRResult {
  dscr: number;
  tier: 'strong' | 'pass' | 'borderline' | 'fail';
}

export interface CapitalStackInputs {
  purchasePrice: number;
  rehabCost: number;
  closingCostsPct: number; // e.g. 3
  downPaymentPct: number;
  sellerConcessionAmt?: number;
  giftFundsAmt?: number;
}

export interface CapitalStackResult {
  totalUses: number;
  loanAmount: number;
  downPayment: number;
  closingCosts: number;
  cashToClose: number;
  equityAtPurchase: number;
}

export interface CashflowInputs {
  grossRent: number;          // monthly
  vacancyRatePct: number;     // e.g. 5
  operatingExpensePct: number;// e.g. 40
  monthlyDebtService: number;
  purchasePrice: number;
  downPaymentAmt: number;
}

export interface CashflowResult {
  effectiveGrossIncome: number; // monthly
  noi: number;                  // monthly
  cashflow: number;             // monthly
  annualCashflow: number;
  cocReturn: number;            // cash-on-cash %
  capRate: number;              // %
}

export interface TaxInputs {
  purchasePrice: number;
  landValuePct: number;        // e.g. 20 (land is not depreciable)
  improvementsValue?: number;  // override if known
  bonusDepreciationPct: number;// e.g. 60 for 2024
  shortLifePct: number;        // % of improvements that are 5/7yr via cost seg
  annualGrossIncome: number;
  marginalTaxRatePct: number;
}

export interface TaxResult {
  depreciableBase: number;
  annualStraightLineDepr: number;
  bonusDepreciationFirstYear: number;
  estimatedTaxSavingsFirstYear: number;
}

// ─── Tenants / Vouchers ─────────────────────────────────────────────────────

export type VoucherStatus =
  | 'referred'
  | 'screening'
  | 'approved'
  | 'rta_submitted'
  | 'hap_contract'
  | 'housed'
  | 'rejected';

export interface Tenant {
  id: string;
  deal_id: string;
  full_name: string;
  voucher_number: string;
  pha_id: string;
  bedroom_size: number;
  voucher_status: VoucherStatus;
  move_in_date?: string;
  created_at: string;
}

// ─── NSPIRE / Inspections ───────────────────────────────────────────────────

export type NSPIRESystem =
  | 'site'
  | 'building_exterior'
  | 'building_systems'
  | 'common_areas'
  | 'unit';

export type NSPIRESeverity = 'life_threatening' | 'severe' | 'moderate' | 'low';

export interface NSPIREItem {
  id: string;
  system: NSPIRESystem;
  deficiency: string;
  severity: NSPIRESeverity;
  hud_ref: string;
  self_correctable: boolean;
  typical_cost_low: number;
  typical_cost_high: number;
}

export interface NSPIREChecklistItem extends NSPIREItem {
  status: 'pass' | 'fail' | 'n/a' | 'pending';
  notes?: string;
}

export interface Inspection {
  id: string;
  deal_id: string;
  inspection_date?: string;
  inspector_name?: string;
  score?: number;
  passed: boolean;
  checklist: NSPIREChecklistItem[];
  created_at: string;
}

// ─── Compliance ─────────────────────────────────────────────────────────────

export type DeadlineType =
  | 'inspection_schedule'
  | 'rta_submission'
  | 'hap_execution'
  | 'lead_disclosure'
  | 'closing'
  | 'rent_increase'
  | 'annual_recert'
  | 'mip_cancellation';

export interface ComplianceDeadline {
  id: string;
  deal_id: string;
  deadline_type: DeadlineType;
  due_date: string;
  completed_at?: string;
  notes?: string;
}

// ─── Market / Lenders ───────────────────────────────────────────────────────

export interface MarketListing {
  id: string;
  address: string;
  city: string;
  state: string;
  asking_price: number;
  units: number;
  gross_rent: number;
  grm: number;          // gross rent multiplier
  score: number;        // 0-100 composite
  flagged: boolean;
  source: string;
  listed_at: string;
}

export interface Lender {
  id: string;
  name: string;
  loan_type: 'FHA' | 'DSCR' | 'Conventional' | 'Portfolio' | 'Hard Money';
  min_ltv: number;
  max_ltv: number;
  rate_floor: number;
  rate_ceiling: number;
  min_dscr?: number;
  min_fico: number;
  states: string[];
  notes?: string;
  last_updated: string;
}

// ─── Documents ──────────────────────────────────────────────────────────────

export type DocType =
  | 'PSA'
  | 'inspection_report'
  | 'appraisal'
  | 'loan_estimate'
  | 'closing_disclosure'
  | 'HAP_contract'
  | 'RFTA'
  | 'lease'
  | 'tenant_id'
  | 'voucher'
  | 'tax_return'
  | 'insurance'
  | 'other';

export interface DealDocument {
  id: string;
  deal_id: string;
  name: string;
  doc_type?: DocType;
  storage_key: string;
  uploaded_by?: string;
  created_at: string;
}

// ─── Portfolio analytics ────────────────────────────────────────────────────

export interface PortfolioMetrics {
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  totalUnits: number;
  totalAskingValue: number;
  totalMonthlyGrossRent: number;
  totalAnnualNOI: number;
  weightedCapRate: number;       // %
  weightedCoCReturn: number;     // %
  weightedDSCR: number;
  pipelineValue: number;         // active (non-dead, non-closed) asking
  stageBreakdown: Record<string, number>;
}

// ─── PHA ─────────────────────────────────────────────────────────────────────

export interface PHA {
  id: string;
  name: string;
  state: string;
  contact_email?: string;
  contact_phone?: string;
  avg_days_rta_to_hap: number;
  payment_standard_2br: number;
  notes?: string;
}
