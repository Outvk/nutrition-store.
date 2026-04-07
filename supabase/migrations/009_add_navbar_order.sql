-- Add navbar_order to allow specific slot selection for featured packs
ALTER TABLE products ADD COLUMN IF NOT EXISTS navbar_order integer;

-- Reset existing show_in_navbar values to navbar_order if needed,
-- but since we are changing the logic, we'll just use navbar_order from now on.
-- 0 or NULL means not in navbar. 1-5 means the slot position.
UPDATE products SET navbar_order = 1 WHERE show_in_navbar = true AND navbar_order IS NULL;

-- Remove old column eventually, but let's keep it for compatibility for 1 migration
-- ALTER TABLE products DROP COLUMN IF EXISTS show_in_navbar;
