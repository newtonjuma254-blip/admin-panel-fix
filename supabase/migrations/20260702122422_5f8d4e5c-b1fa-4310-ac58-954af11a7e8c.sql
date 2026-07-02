
-- Restrict content management to the single admin email (email/password sign-in).
-- Public read remains unchanged.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','categories','category_tiles','hero_slides','blog_posts','store_locations','site_settings']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated manage %s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "Admin manage %1$s" ON public.%1$I FOR ALL TO authenticated USING ((auth.jwt() ->> ''email'') = ''newtonjuma254@gmail.com'') WITH CHECK ((auth.jwt() ->> ''email'') = ''newtonjuma254@gmail.com'')',
      t
    );
  END LOOP;
END $$;

-- Orders: only admin can read/update/delete. Public inserts (checkout) still allowed via existing INSERT policy.
DROP POLICY IF EXISTS "Signed in users manage orders" ON public.orders;
CREATE POLICY "Admin read orders" ON public.orders
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com');
CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com');
CREATE POLICY "Admin delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com');

-- Storage: restrict media bucket writes to admin. Public read remains.
DROP POLICY IF EXISTS "Signed in users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Signed in users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Signed in users can delete media" ON storage.objects;

CREATE POLICY "Admin can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com');
CREATE POLICY "Admin can update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com')
  WITH CHECK (bucket_id = 'media' AND (auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com');
CREATE POLICY "Admin can delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (auth.jwt() ->> 'email') = 'newtonjuma254@gmail.com');
