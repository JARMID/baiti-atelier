-- MONYUN Atelier: Seed Data Migration
-- Prepopulates Algerian artisan workshops across key wilayas with realistic tooling, rate cards, and profile systems.

-- 1. SEED WORKSHOPS
INSERT INTO workshops (
  id, name, slug, trade, wilaya_code, wilaya_name, city, address, phone, whatsapp, email, rating, total_jobs_completed, wholesale_rate_per_kg, wholesale_glass_rate_per_m2, wholesale_labor_rate_per_hour, is_verified
) VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Atelier Alum Moderne Kouba',
    'atelier-alum-moderne-kouba',
    'aluminum',
    '16',
    'Alger',
    'Kouba',
    'Cité Garidi 1, Bt 14, Kouba, Alger',
    '+213550123456',
    '213550123456',
    'contact@kouba-alu.dz',
    4.92,
    168,
    880.00,
    3200.00,
    1200.00,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Menuiserie Alu & PVC El Bahia',
    'menuiserie-alu-pvc-el-bahia',
    'aluminum',
    '31',
    'Oran',
    'Es Senia',
    'Zone Artisanale Es Senia, Oran',
    '+213661987654',
    '213661987654',
    'contact@elbahia-pvc.dz',
    4.85,
    210,
    850.00,
    2950.00,
    1100.00,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Cirta Profils & Façades',
    'cirta-profils-facades',
    'aluminum',
    '25',
    'Constantine',
    'Ali Mendjeli',
    'UV 05, Nouvelle Ville Ali Mendjeli, Constantine',
    '+213770456789',
    '213770456789',
    'contact@cirtaprofils.dz',
    4.78,
    125,
    860.00,
    3100.00,
    1150.00,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Atelier Menuiserie du Chélif',
    'atelier-menuiserie-du-chelif',
    'woodworking',
    '09',
    'Blida',
    'Ouled Yaich',
    'Zone Industrielle Ben Boulaid, Blida',
    '+213551223344',
    '213551223344',
    'contact@bois-blida.dz',
    4.90,
    142,
    750.00,
    2600.00,
    1300.00,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Ferronnerie d’Art & Sécurité Bab Ezzouar',
    'ferronnerie-art-bab-ezzouar',
    'metalwork',
    '16',
    'Alger',
    'Bab Ezzouar',
    'Zone d’Activité Bab Ezzouar, Alger',
    '+213771998877',
    '213771998877',
    'contact@acier-alger.dz',
    4.88,
    195,
    650.00,
    2200.00,
    1250.00,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'Atelier Haute Couture & Tapisserie Télégraphe',
    'atelier-tapisserie-telegraphe',
    'woodworking',
    '16',
    'Alger',
    'Hydra',
    'Rue Doudou Mokhtar, Ben Aknoun / Hydra, Alger',
    '+213554887766',
    '213554887766',
    'contact@tapisserie-alger.dz',
    4.95,
    88,
    920.00,
    4500.00,
    1500.00,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- 2. SEED WORKSHOP PROFILES (KOUBA)
INSERT INTO workshop_profiles (
  workshop_id, profile_system, profile_name, code, weight_per_meter_kg, default_bar_length_mm, finish_color, cost_per_meter_dzd
) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Alugraf 40', 'Dormant Tubulaire 40mm', 'TPR-401', 1.050, 6000.00, 'RAL 9016 Blanc', 890.00),
  ('a1000000-0000-0000-0000-000000000001', 'Alugraf 40', 'Ouvrant Frappe 40mm', 'TPR-402', 1.180, 6000.00, 'RAL 9016 Blanc', 980.00),
  ('a1000000-0000-0000-0000-000000000001', 'Alugraf 40', 'Meneau Traverse 40mm', 'TPR-403', 1.250, 6000.00, 'RAL 9016 Blanc', 1040.00),
  ('a1000000-0000-0000-0000-000000000001', 'Coulissant 67', 'Cadre Dormant 2 Rails 67mm', 'TPR-671', 1.620, 6000.00, 'RAL 7016 Gris Anthracite', 1450.00),
  ('a1000000-0000-0000-0000-000000000001', 'Coulissant 67', 'Vantail Coulissant Renforcé', 'TPR-672', 1.480, 6000.00, 'RAL 7016 Gris Anthracite', 1320.00),
  ('a1000000-0000-0000-0000-000000000001', 'RPT 52', 'Dormant Rupture Thermique 52mm', 'TPR-RPT52-D', 1.820, 6000.00, 'RAL 7016 Gris Anthracite', 2150.00),
  ('a1000000-0000-0000-0000-000000000001', 'RPT 52', 'Ouvrant Rupture Thermique 52mm', 'TPR-RPT52-O', 1.950, 6000.00, 'RAL 7016 Gris Anthracite', 2380.00)
ON CONFLICT DO NOTHING;

-- 3. SEED WORKSHOP GLASS (CEVITAL MFG / LARBAA SPECS)
INSERT INTO workshop_glass (
  workshop_id, glass_type, thickness_mm, is_double_glazing, spacer_mm, price_per_m2_dzd
) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Simple Vitrage Clair MFG', 4.0, FALSE, 0.0, 1850.00),
  ('a1000000-0000-0000-0000-000000000001', 'Simple Vitrage Clair MFG', 6.0, FALSE, 0.0, 2400.00),
  ('a1000000-0000-0000-0000-000000000001', 'Double Vitrage 4/12/4 Clair', 20.0, TRUE, 12.0, 3800.00),
  ('a1000000-0000-0000-0000-000000000001', 'Double Vitrage 4/16/4 Argon Isolation', 24.0, TRUE, 16.0, 4600.00),
  ('a1000000-0000-0000-0000-000000000001', 'Stop-Sol Réfléchissant Bronze 6mm', 6.0, FALSE, 0.0, 3900.00),
  ('a1000000-0000-0000-0000-000000000001', 'Vitrage Sablé Dépoli Opaque 6mm', 6.0, FALSE, 0.0, 3100.00)
ON CONFLICT DO NOTHING;

-- 4. SEED SAMPLE CUTTING REMNANTS IN STOCK
INSERT INTO remnant_inventory (
  workshop_id, profile_code, length_mm, width_mm, material_type, cost_value_dzd, storage_rack, is_reserved
) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'TPR-401', 1450.00, NULL, 'aluminum', 1280.00, 'Rack A-03', FALSE),
  ('a1000000-0000-0000-0000-000000000001', 'TPR-402', 2100.00, NULL, 'aluminum', 2050.00, 'Rack A-04', FALSE),
  ('a1000000-0000-0000-0000-000000000001', 'TPR-671', 1850.00, NULL, 'aluminum', 2680.00, 'Rack B-01', FALSE),
  ('a1000000-0000-0000-0000-000000000001', 'VERRE-DBL', 1200.00, 850.00, 'glass', 3870.00, 'Chevalet Verre 2', FALSE)
ON CONFLICT DO NOTHING;
