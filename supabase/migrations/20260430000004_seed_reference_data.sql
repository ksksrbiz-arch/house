-- Seed reference data: states, PHAs, lenders

-- ─── States (11) ──────────────────────────────────────────────────────────
insert into public.states (code, name) values
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
  ('NC', 'North Carolina')
on conflict (code) do nothing;

-- ─── PHAs (7) ─────────────────────────────────────────────────────────────
insert into public.phas (name, state, contact_email, avg_days_rta_to_hap, payment_standard_2br) values
  ('Cuyahoga Metropolitan Housing Authority', 'OH', 'rfta@cmha.net', 30, 1050),
  ('Detroit Housing Commission', 'MI', 'vouchers@detroithc.org', 45, 975),
  ('Philadelphia Housing Authority', 'PA', 'section8@pha.phila.gov', 60, 1450),
  ('Indianapolis Housing Agency', 'IN', 'hcv@indyha.org', 35, 950),
  ('Chicago Housing Authority', 'IL', 'hcv@thecha.org', 90, 1600),
  ('Memphis Housing Authority', 'TN', 'section8@mha.org', 40, 875),
  ('Atlanta Housing', 'GA', 'hcv@atlantahousing.org', 50, 1250)
on conflict do nothing;

-- ─── Lenders (14) ─────────────────────────────────────────────────────────
insert into public.lenders (name, loan_type, min_ltv, max_ltv, rate_floor, rate_ceiling, min_dscr, min_fico, states, notes) values
  ('CrossCountry Mortgage', 'FHA', 0, 96.5, 6.875, 8.25, null, 580, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Strong FHA shop; house-hack specialist'),
  ('Movement Mortgage', 'FHA', 0, 96.5, 6.75, 8.125, null, 580, '{"OH","MI","PA","IN","IL"}', 'Fast close; 17-day average'),
  ('Kiavi', 'DSCR', 0, 80, 7.5, 11.0, 1.0, 640, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Online DSCR lender; no income verification'),
  ('Visio Lending', 'DSCR', 0, 80, 7.875, 12.0, 1.0, 620, '{"OH","MI","PA","IN","IL","TN","GA","FL","TX"}', 'Rental portfolio focus'),
  ('Lima One Capital', 'DSCR', 0, 75, 8.0, 13.0, 1.1, 660, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Fix-and-hold; bridge to DSCR refi'),
  ('Rocket Mortgage', 'Conventional', 3, 97, 6.625, 8.0, null, 620, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Nationwide; good for 5%+ down conventional'),
  ('United Wholesale Mortgage', 'Conventional', 3, 97, 6.5, 7.875, null, 620, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Broker channel only'),
  ('Arbor Realty Trust', 'Portfolio', 0, 75, 7.0, 9.5, 1.2, 680, '{"OH","MI","PA","IL","GA","FL","TX"}', 'Commercial multifamily; 5+ units'),
  ('Ready Capital', 'Portfolio', 0, 75, 7.25, 10.0, 1.2, 660, '{"OH","MI","PA","IN","IL","TN","GA","FL","TX","NC"}', 'Small balance commercial; bridge available'),
  ('Patch of Land', 'Hard Money', 0, 70, 10.0, 14.0, null, 580, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX"}', 'Bridge and fix-flip; 12-18 month terms'),
  ('RCN Capital', 'Hard Money', 0, 75, 9.99, 13.5, null, 580, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Fix-and-flip + rental; fast approval'),
  ('Lendio', 'Portfolio', 0, 80, 7.5, 11.0, 1.1, 640, '{"OH","MI","PA","IN","IL","TN","GA","FL","TX"}', 'Marketplace; multiple portfolio lenders'),
  ('NewRez', 'FHA', 0, 96.5, 6.875, 8.375, null, 580, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Non-QM + FHA; helpful for self-employed borrowers'),
  ('Better Mortgage', 'Conventional', 3, 97, 6.5, 7.75, null, 620, '{"OH","MI","PA","IN","IL","KY","TN","GA","FL","TX","NC"}', 'Online-only; lowest closing costs on conventional')
on conflict do nothing;
