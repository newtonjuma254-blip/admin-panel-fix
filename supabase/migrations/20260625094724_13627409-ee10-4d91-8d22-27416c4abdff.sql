ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders can be created from storefront" ON public.orders;
DROP POLICY IF EXISTS "Signed in users manage orders" ON public.orders;

CREATE POLICY "Orders can be created from storefront"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (jsonb_typeof(items) = 'array');

CREATE POLICY "Signed in users manage orders"
ON public.orders
FOR ALL
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Media objects are publicly readable" ON storage.objects;
    DROP POLICY IF EXISTS "Signed in users can upload media" ON storage.objects;
    DROP POLICY IF EXISTS "Signed in users can update media" ON storage.objects;
    DROP POLICY IF EXISTS "Signed in users can delete media" ON storage.objects;

    CREATE POLICY "Media objects are publicly readable"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'media');

    CREATE POLICY "Signed in users can upload media"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'media' AND (SELECT auth.role()) = 'authenticated');

    CREATE POLICY "Signed in users can update media"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'media' AND (SELECT auth.role()) = 'authenticated')
    WITH CHECK (bucket_id = 'media' AND (SELECT auth.role()) = 'authenticated');

    CREATE POLICY "Signed in users can delete media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'media' AND (SELECT auth.role()) = 'authenticated');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';