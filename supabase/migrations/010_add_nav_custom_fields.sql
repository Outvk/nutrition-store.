-- Add nav_label and nav_image to allow custom display in the mega menu
ALTER TABLE products ADD COLUMN IF NOT EXISTS nav_label text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nav_image text;
