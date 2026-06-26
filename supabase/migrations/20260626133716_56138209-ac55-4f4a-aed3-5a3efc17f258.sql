DROP POLICY IF EXISTS "Orders can be created from storefront" ON public.orders;

CREATE POLICY "Orders can be created from storefront"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK ((select auth.role()) IN ('anon', 'authenticated'));

NOTIFY pgrst, 'reload schema';