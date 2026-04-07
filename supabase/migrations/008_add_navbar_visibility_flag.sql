-- Add a field to mark products for navbar visibility
-- Specifically useful for showing select packs in the mega menu
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_in_navbar boolean DEFAULT false;

-- Index for performance when fetching navbar items
CREATE INDEX IF NOT EXISTS idx_products_show_in_navbar ON products(show_in_navbar) WHERE show_in_navbar = true;
