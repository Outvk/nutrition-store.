-- Allow NULL for variant_id in order_items table
-- This allows for products that do not have variants (simple products)
ALTER TABLE order_items ALTER COLUMN variant_id DROP NOT NULL;
