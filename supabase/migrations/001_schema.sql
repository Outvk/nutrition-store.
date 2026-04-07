-- PART 1 — EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; 
-- pg_trgm is for fast text search on product names

-- PART 2 — CREATE ALL TABLES IN THIS EXACT ORDER

-- TABLE 1: brands
CREATE TABLE brands (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          text NOT NULL,
  logo_url      text,
  is_visible    boolean DEFAULT true,
  created_at    timestamptz DEFAULT NOW()
);

-- TABLE 2: categories
CREATE TABLE categories (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  image_url     text,
  created_at    timestamptz DEFAULT NOW()
);

-- TABLE 3: products
CREATE TABLE products (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          text NOT NULL,
  description   text,
  price         decimal(10,2) NOT NULL CHECK (price >= 0),
  sale_price    decimal(10,2) CHECK (sale_price >= 0),
  images        text[] DEFAULT '{}',
  brand_id      uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active     boolean DEFAULT true,
  is_on_sale    boolean DEFAULT false,
  created_at    timestamptz DEFAULT NOW(),
  updated_at    timestamptz DEFAULT NOW(),

  CONSTRAINT sale_price_less_than_price 
    CHECK (sale_price IS NULL OR sale_price < price)
);

-- TABLE 4: variants
CREATE TABLE variants (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  flavor        text NOT NULL,
  size          text NOT NULL,
  stock         integer DEFAULT 0 CHECK (stock >= 0),
  created_at    timestamptz DEFAULT NOW()
);

-- TABLE 5: orders
CREATE TABLE orders (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name     text NOT NULL CHECK (length(full_name) >= 3),
  phone         text NOT NULL CHECK (phone ~ '^(05|06|07)[0-9]{8}$'),
  wilaya        text NOT NULL,
  address       text NOT NULL CHECK (length(address) >= 10),
  total         decimal(10,2) NOT NULL CHECK (total >= 0),
  delivery_fee  decimal(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN (
                  'pending','confirmed','shipped',
                  'delivered','cancelled'
                )),
  notes         text,
  created_at    timestamptz DEFAULT NOW(),
  updated_at    timestamptz DEFAULT NOW()
);

-- TABLE 6: order_items
CREATE TABLE order_items (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id    uuid NOT NULL REFERENCES variants(id) ON DELETE RESTRICT,
  quantity      integer NOT NULL CHECK (quantity >= 1 AND quantity <= 100),
  unit_price    decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at    timestamptz DEFAULT NOW()
);

-- TABLE 7: sale_events
CREATE TABLE sale_events (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  label         text NOT NULL,
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  is_active     boolean DEFAULT false,
  created_at    timestamptz DEFAULT NOW(),

  CONSTRAINT end_after_start 
    CHECK (ends_at > starts_at)
);

-- TABLE 8: delivery_fees
CREATE TABLE delivery_fees (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  wilaya        text UNIQUE NOT NULL,
  fee           decimal(10,2) NOT NULL CHECK (fee >= 0),
  updated_at    timestamptz DEFAULT NOW()
);

-- TABLE 9: store_settings
CREATE TABLE store_settings (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_name    text DEFAULT 'AdemNutrition',
  phone         text,
  instagram     text,
  facebook      text,
  email         text,
  description   text,
  default_delivery_fee decimal(10,2) DEFAULT 700,
  updated_at    timestamptz DEFAULT NOW()
);

INSERT INTO store_settings (id) 
VALUES (uuid_generate_v4());

-- PART 3 — INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

CREATE INDEX idx_variants_product_id ON variants(product_id);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_phone ON orders(phone);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- PART 4 — AUTO UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- PART 5 — ANTI SPAM TRIGGER
CREATE OR REPLACE FUNCTION check_order_spam()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM orders
    WHERE phone = NEW.phone
    AND status = 'pending'
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many pending orders from this phone number';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_order_spam
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION check_order_spam();

-- PART 6 — STOCK DECREMENT FUNCTION
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE variants
  SET stock = stock - p_quantity
  WHERE id = p_variant_id;

  IF (SELECT stock FROM variants WHERE id = p_variant_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 7 — DASHBOARD STATS FUNCTION
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
  SELECT json_build_object(
    'total_revenue',
      COALESCE(SUM(total) FILTER (WHERE status = 'delivered'), 0),
    'total_orders',
      COUNT(*),
    'pending_count',
      COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed_count',
      COUNT(*) FILTER (WHERE status = 'confirmed'),
    'shipped_count',
      COUNT(*) FILTER (WHERE status = 'shipped'),
    'delivered_count',
      COUNT(*) FILTER (WHERE status = 'delivered'),
    'cancelled_count',
      COUNT(*) FILTER (WHERE status = 'cancelled'),
    'today_orders',
      COUNT(*) FILTER (
        WHERE created_at > NOW() - INTERVAL '24 hours'
      ),
    'today_revenue',
      COALESCE(SUM(total) FILTER (
        WHERE status = 'delivered'
        AND created_at > NOW() - INTERVAL '24 hours'
      ), 0)
  ) FROM orders;
$$ LANGUAGE sql SECURITY DEFINER;

-- PART 8 — GET LOW STOCK FUNCTION
CREATE OR REPLACE FUNCTION get_low_stock(threshold integer DEFAULT 5)
RETURNS TABLE (
  variant_id    uuid,
  product_name  text,
  flavor        text,
  size          text,
  stock         integer
) AS $$
  SELECT
    v.id,
    p.name,
    v.flavor,
    v.size,
    v.stock
  FROM variants v
  JOIN products p ON p.id = v.product_id
  WHERE v.stock <= threshold
  ORDER BY v.stock ASC;
$$ LANGUAGE sql SECURITY DEFINER;

-- PART 9 — RLS POLICIES
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- BRANDS
CREATE POLICY "public read visible brands"
ON brands FOR SELECT USING (is_visible = true);

CREATE POLICY "admin full access brands"
ON brands FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- CATEGORIES
CREATE POLICY "public read categories"
ON categories FOR SELECT USING (true);

CREATE POLICY "admin full access categories"
ON categories FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- PRODUCTS
CREATE POLICY "public read active products"
ON products FOR SELECT USING (is_active = true);

CREATE POLICY "admin full access products"
ON products FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- VARIANTS
CREATE POLICY "public read variants of active products"
ON variants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = variants.product_id
    AND p.is_active = true
  )
);

CREATE POLICY "admin full access variants"
ON variants FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ORDERS
CREATE POLICY "anyone can place order"
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "admin full access orders"
ON orders FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ORDER ITEMS
CREATE POLICY "anyone can insert order items"
ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "admin full access order items"
ON order_items FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- SALE EVENTS
CREATE POLICY "public read active sales"
ON sale_events FOR SELECT
USING (
  is_active = true
  AND starts_at <= NOW()
  AND ends_at >= NOW()
);

CREATE POLICY "admin full access sale events"
ON sale_events FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- DELIVERY FEES
CREATE POLICY "public read delivery fees"
ON delivery_fees FOR SELECT USING (true);

CREATE POLICY "admin full access delivery fees"
ON delivery_fees FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- STORE SETTINGS
CREATE POLICY "public read store settings"
ON store_settings FOR SELECT USING (true);

CREATE POLICY "admin full access store settings"
ON store_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- PART 10 — SEED DATA
INSERT INTO delivery_fees (wilaya, fee) VALUES
  ('Alger', 400),
  ('Blida', 400),
  ('Boumerdès', 450),
  ('Tipaza', 450),
  ('Tizi Ouzou', 500),
  ('Béjaïa', 500),
  ('Oran', 500),
  ('Constantine', 500),
  ('Sétif', 550),
  ('Béchar', 600),
  ('Annaba', 600),
  ('Biskra', 600),
  ('Ouargla', 650),
  ('Tamanrasset', 700),
  ('Adrar', 700),
  ('Tindouf', 700),
  ('Illizi', 700),
  ('In Guezzam', 750);
