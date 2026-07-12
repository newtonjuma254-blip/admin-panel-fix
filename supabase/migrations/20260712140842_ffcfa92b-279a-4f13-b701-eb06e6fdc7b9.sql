
-- Fix 1: Tighten orders INSERT policy (remove WITH CHECK true)
DROP POLICY IF EXISTS "Public storefront checkout inserts" ON public.orders;
CREATE POLICY "Public storefront checkout inserts"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND length(btrim(customer_name)) > 0
    AND length(btrim(customer_phone)) > 0
    AND total >= 0
  );

-- Fix 2: Restrict media bucket public reads to known public folders
DROP POLICY IF EXISTS "Media objects are publicly readable" ON storage.objects;
CREATE POLICY "Public media folders are readable"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = ANY (ARRAY['logo','products','hero','tiles','blog','uploads'])
  );
