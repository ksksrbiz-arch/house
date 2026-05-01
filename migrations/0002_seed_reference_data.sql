-- Seed reference data: states, PHAs, lenders

-- ─── States (11) ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO states (code, name) VALUES
  ('OH', 'Ohio'),
  ('MI', 'Michigan'),
  ('PA', 'Pennsylvania'),
  ('IN', 'Indiana'),
  ('IL', 'Illinois'),
  ('KY', 'Kentucky'),
  ('TN', 'Tennessee'),
  ('GA', 'Georgia'),
  ('FL', 'Florida'),
  ('TX', 'Texas'),
  ('NC', 'North Carolina');

-- ─── PHAs (7) ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO phas (id, name, state, contact_email, avg_days_rta_to_hap, payment_standard_2br) VALUES
  ('pha-cmha',         'Cuyahoga Metropolitan Housing Authority', 'OH', 'rfta@cmha.net', 30, 1050),
  ('pha-detroit',      'Detroit Housing Commission', 'MI', 'vouchers@detroithc.org', 45, 975),
  ('pha-philly',       'Philadelphia Housing Authority', 'PA', 'section8@pha.phila.gov', 60, 1450),
  ('pha-indy',         'Indianapolis Housing Agency', 'IN', 'hcv@indyha.org', 35, 950),
  ('pha-chicago',      'Chicago Housing Authority', 'IL', 'hcv@thecha.org', 90, 1600),
  ('pha-memphis',      'Memphis Housing Authority', 'TN', 'section8@mha.org', 40, 875),
  ('pha-atlanta',      'Atlanta Housing', 'GA', 'hcv@atlantahousing.org', 50, 1250);

-- ─── Lenders (14) ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO lenders (id, name, loan_type, min_ltv, max_ltv, rate_floor, rate_ceiling, min_dscr, min_fico, states, notes) VALUES
  ('lender-crosscountry', 'CrossCountry Mortgage', 'FHA', 0, 96.5, 6.875, 8.25, NULL, 580, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Strong FHA shop; house-hack specialist'),
  ('lender-movement',     'Movement Mortgage', 'FHA', 0, 96.5, 6.75, 8.125, NULL, 580, '["OH","MI","PA","IN","IL"]', 'Fast close; 17-day average'),
  ('lender-kiavi',        'Kiavi', 'DSCR', 0, 80, 7.5, 11.0, 1.0, 640, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Online DSCR lender; no income verification'),
  ('lender-visio',        'Visio Lending', 'DSCR', 0, 80, 7.875, 12.0, 1.0, 620, '["OH","MI","PA","IN","IL","TN","GA","FL","TX"]', 'Rental portfolio focus'),
  ('lender-limaone',      'Lima One Capital', 'DSCR', 0, 75, 8.0, 13.0, 1.1, 660, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Fix-and-hold; bridge to DSCR refi'),
  ('lender-rocket',       'Rocket Mortgage', 'Conventional', 3, 97, 6.625, 8.0, NULL, 620, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Nationwide; good for 5%+ down conventional'),
  ('lender-uwm',          'United Wholesale Mortgage', 'Conventional', 3, 97, 6.5, 7.875, NULL, 620, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Broker channel only'),
  ('lender-arbor',        'Arbor Realty Trust', 'Portfolio', 0, 75, 7.0, 9.5, 1.2, 680, '["OH","MI","PA","IL","GA","FL","TX"]', 'Commercial multifamily; 5+ units'),
  ('lender-readycap',     'Ready Capital', 'Portfolio', 0, 75, 7.25, 10.0, 1.2, 660, '["OH","MI","PA","IN","IL","TN","GA","FL","TX","NC"]', 'Small balance commercial; bridge available'),
  ('lender-patchofland',  'Patch of Land', 'Hard Money', 0, 70, 10.0, 14.0, NULL, 580, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX"]', 'Bridge and fix-flip; 12-18 month terms'),
  ('lender-rcn',          'RCN Capital', 'Hard Money', 0, 75, 9.99, 13.5, NULL, 580, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Fix-and-flip + rental; fast approval'),
  ('lender-lendio',       'Lendio', 'Portfolio', 0, 80, 7.5, 11.0, 1.1, 640, '["OH","MI","PA","IN","IL","TN","GA","FL","TX"]', 'Marketplace; multiple portfolio lenders'),
  ('lender-newrez',       'NewRez', 'FHA', 0, 96.5, 6.875, 8.375, NULL, 580, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Non-QM + FHA; helpful for self-employed borrowers'),
  ('lender-better',       'Better Mortgage', 'Conventional', 3, 97, 6.5, 7.75, NULL, 620, '["OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"]', 'Online-only; lowest closing costs on conventional');
