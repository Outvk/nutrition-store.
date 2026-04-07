-- Products: anyone can read active products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products"
ON products FOR SELECT
USING (is_active = true);

-- Admin can do everything on products
CREATE POLICY "admin full access products"
ON products FOR ALL
USING (auth.role() = 'authenticated');

-- Orders: anyone can insert
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can place order"
ON orders FOR INSERT
WITH CHECK (true);

-- Admin can read and update orders
CREATE POLICY "admin manage orders"
ON orders FOR ALL
USING (auth.role() = 'authenticated');

-- Order items: anyone can insert
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- Variants: public can read
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read variants"
ON variants FOR SELECT
USING (true);

-- Admin manages variants
CREATE POLICY "admin manage variants"
ON variants FOR ALL
USING (auth.role() = 'authenticated');

-- Brands and categories: public read
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read brands"
ON brands FOR SELECT USING (is_visible = true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories"
ON categories FOR SELECT USING (true);


CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(total) 
      FILTER (WHERE status = 'delivered'), 0),
    'total_orders', COUNT(*),
    'pending_count', COUNT(*) 
      FILTER (WHERE status = 'pending')
  ) FROM orders;
$$ LANGUAGE sql SECURITY DEFINER;
