-- Add 'abandoned' to the status check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','returned', 'abandoned'));

-- Update the handle_order_status_change function to treat 'abandoned' correctly
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_item record;
BEGIN
  -- If status changes TO 'cancelled', 'returned' OR 'abandoned' FROM an active status
  -- (Though an order shouldn't normally move TO abandoned from active, but for completeness)
  IF (NEW.status IN ('cancelled', 'returned', 'abandoned')) 
     AND (OLD.status IN ('pending', 'confirmed', 'shipped', 'delivered')) THEN
    
    FOR v_item IN (SELECT variant_id, quantity FROM order_items WHERE order_id = NEW.id AND variant_id IS NOT NULL)
    LOOP
      UPDATE variants SET stock = stock + v_item.quantity WHERE id = v_item.variant_id;
    END LOOP;
    
  -- If status changes FROM 'cancelled', 'returned' OR 'abandoned' TO an active status
  ELSIF (OLD.status IN ('cancelled', 'returned', 'abandoned')) 
        AND (NEW.status IN ('pending', 'confirmed', 'shipped', 'delivered')) THEN
        
    FOR v_item IN (SELECT variant_id, quantity FROM order_items WHERE order_id = NEW.id AND variant_id IS NOT NULL)
    LOOP
      UPDATE variants SET stock = stock - v_item.quantity WHERE id = v_item.variant_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow abandoned cart tracking
-- We allow public UPDATE and DELETE on orders that HAVE the 'abandoned' status.
CREATE POLICY "anyone can update abandoned orders"
ON orders FOR UPDATE
USING (status = 'abandoned')
WITH CHECK (status = 'abandoned');

CREATE POLICY "anyone can delete abandoned orders"
ON orders FOR DELETE
USING (status = 'abandoned');


