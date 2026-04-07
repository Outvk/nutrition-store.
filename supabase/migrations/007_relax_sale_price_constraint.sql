-- Relax the sale price constraint to allow it to be equal to the price
-- This is useful for packs where you might want to show them as "on sale" but at their full set price
ALTER TABLE products DROP CONSTRAINT IF EXISTS sale_price_less_than_price;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sale_price_check;

ALTER TABLE products ADD CONSTRAINT sale_price_check 
  CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price));
