-- 012_delivery_fee_function.sql
-- Function to get the delivery fee for a specific wilaya, or the default fee.

CREATE OR REPLACE FUNCTION get_delivery_fee(p_wilaya_name text)
RETURNS integer AS $$
DECLARE
  v_fee integer;
BEGIN
  -- 1. Try to get the fee from the delivery_fees table
  SELECT fee INTO v_fee FROM delivery_fees WHERE wilaya = p_wilaya_name LIMIT 1;

  -- 2. If not found, use the default from store_settings
  IF v_fee IS NULL THEN
    SELECT default_delivery_fee INTO v_fee FROM store_settings LIMIT 1;
  END IF;

  -- 3. Return the result, ensuring a minimum of 0
  RETURN COALESCE(v_fee, 700);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
