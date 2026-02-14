-- ============================================================================
-- Update BOC JSONB defaults from objects to arrays (12 editable rows each)
-- Run in Supabase SQL Editor AFTER 004_boc.sql
-- ============================================================================

ALTER TABLE boc_settings
ALTER COLUMN overhead_items SET DEFAULT '[{"label":"Machine payment","amount":0},{"label":"Supporting equipment & tools","amount":0},{"label":"Consumable supplies","amount":0},{"label":"Digital/pantograph patterns","amount":0},{"label":"Insurance","amount":0},{"label":"Tech maintenance","amount":0},{"label":"Electricity","amount":0},{"label":"Phone usage","amount":0},{"label":"Recordkeeping software","amount":0},{"label":"Shelving/bins/organization","amount":0},{"label":"Business cards/marketing","amount":0},{"label":"Training/classes","amount":0}]'::jsonb;

ALTER TABLE boc_settings
ALTER COLUMN incidentals_items SET DEFAULT '[{"label":"Consultation & measurement","minutes":0},{"label":"Planning & design","minutes":0},{"label":"Threading & bobbin winding","minutes":0},{"label":"Prep (trimming, pressing, seaming)","minutes":0},{"label":"Loading quilt","minutes":0},{"label":"Packaging & delivery","minutes":0},{"label":"Photos & social media","minutes":0},{"label":"Seam ripper time","minutes":0},{"label":"Billing & recordkeeping","minutes":0},{"label":"Cleaning & maintenance","minutes":0},{"label":"","minutes":0},{"label":"","minutes":0}]'::jsonb;
