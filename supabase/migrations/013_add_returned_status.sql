-- Drop existing constraint safely
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated constraint with 'returned'
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','returned'));

-- Function to handle order status changes: restoring stock or re-deducting it
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_item record;
BEGIN
  -- If status changes TO 'cancelled' or 'returned' FROM an active status
  IF (NEW.status = 'cancelled' OR NEW.status = 'returned') 
     AND (OLD.status IN ('pending', 'confirmed', 'shipped', 'delivered')) THEN
    
    FOR v_item IN (SELECT variant_id, quantity FROM order_items WHERE order_id = NEW.id AND variant_id IS NOT NULL)
    LOOP
      UPDATE variants SET stock = stock + v_item.quantity WHERE id = v_item.variant_id;
    END LOOP;
    
  -- If status changes FROM 'cancelled' or 'returned' TO an active status
  ELSIF (OLD.status = 'cancelled' OR OLD.status = 'returned') 
        AND (NEW.status IN ('pending', 'confirmed', 'shipped', 'delivered')) THEN
        
    FOR v_item IN (SELECT variant_id, quantity FROM order_items WHERE order_id = NEW.id AND variant_id IS NOT NULL)
    LOOP
      UPDATE variants SET stock = stock - v_item.quantity WHERE id = v_item.variant_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on orders
DROP TRIGGER IF EXISTS trg_handle_order_status_change ON orders;
CREATE TRIGGER trg_handle_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_order_status_change();
