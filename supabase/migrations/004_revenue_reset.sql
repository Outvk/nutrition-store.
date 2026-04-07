INSERT INTO store_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000000') 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS and add basic policies if not present
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can do everything on store_settings') THEN
        CREATE POLICY "Admins can do everything on store_settings" ON store_settings
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  reset_date timestamptz;
BEGIN
  -- Get the last reset date for the fixed store ID
  SELECT COALESCE(revenue_reset_at, '2000-01-01 00:00:00+00') INTO reset_date 
  FROM store_settings 
  WHERE id = '00000000-0000-0000-0000-000000000000';

  -- If still null (row doesn't exist), default to old date
  IF reset_date IS NULL THEN
    reset_date := '2000-01-01 00:00:00+00';
  END IF;

  RETURN (
    SELECT json_build_object(
      'total_revenue',
        COALESCE(SUM(total) FILTER (WHERE status = 'delivered' AND created_at >= reset_date), 0),
      'total_orders',
        COUNT(*) FILTER (WHERE created_at >= reset_date),
      'pending_count',
        COUNT(*) FILTER (WHERE status = 'pending' AND created_at >= reset_date),
      'confirmed_count',
        COUNT(*) FILTER (WHERE status = 'confirmed' AND created_at >= reset_date),
      'shipped_count',
        COUNT(*) FILTER (WHERE status = 'shipped' AND created_at >= reset_date),
      'delivered_count',
        COUNT(*) FILTER (WHERE status = 'delivered' AND created_at >= reset_date),
      'cancelled_count',
        COUNT(*) FILTER (WHERE status = 'cancelled' AND created_at >= reset_date),
      'today_orders',
        COUNT(*) FILTER (
          WHERE created_at > (NOW() - INTERVAL '24 hours')
          AND created_at >= reset_date
        ),
      'today_revenue',
        COALESCE(SUM(total) FILTER (
          WHERE status = 'delivered'
          AND created_at > (NOW() - INTERVAL '24 hours')
          AND created_at >= reset_date
        ), 0)
    ) FROM orders
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
