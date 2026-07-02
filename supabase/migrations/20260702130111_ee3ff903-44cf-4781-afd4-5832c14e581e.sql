DROP POLICY IF EXISTS "Orders can be created from storefront" ON public.orders;
CREATE POLICY "Public storefront checkout inserts"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);