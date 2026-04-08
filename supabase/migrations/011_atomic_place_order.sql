-- Create a new atomic order placement function to fix race conditions
-- This function handles order insertion, order items insertion, and stock decrement in a single transaction.

CREATE OR REPLACE FUNCTION place_order(
  p_order_data jsonb,
  p_items jsonb
)
RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
BEGIN
  -- 1. Insert Order
  INSERT INTO orders (
    full_name, 
    phone, 
    wilaya, 
    address, 
    total, 
    delivery_fee, 
    notes,
    status
  ) VALUES (
    p_order_data->>'full_name',
    p_order_data->>'phone',
    p_order_data->>'wilaya',
    p_order_data->>'address',
    (p_order_data->>'total')::decimal,
    (p_order_data->>'delivery_fee')::decimal,
    p_order_data->>'notes',
    COALESCE(p_order_data->>'status', 'pending')
  ) RETURNING id INTO v_order_id;

  -- 2. Loop through items and insert them + decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Insert Order Item
    INSERT INTO order_items (
      order_id, 
      product_id, 
      variant_id, 
      quantity, 
      unit_price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::decimal
    );

    -- Decrement stock if variant_id is provided
    -- The existing decrement_stock function already handles negative stock check and raises exception
    IF (v_item->>'variant_id') IS NOT NULL THEN
      PERFORM decrement_stock(
        (v_item->>'variant_id')::uuid, 
        (v_item->>'quantity')::integer
      );
    END IF;
  END LOOP;

  RETURN v_order_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Any exception in plpgsql rolls back the transaction
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
