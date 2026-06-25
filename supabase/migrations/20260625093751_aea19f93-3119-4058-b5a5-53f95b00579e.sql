ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders can be created from storefront" ON public.orders;
DROP POLICY IF EXISTS "Signed in users manage orders" ON public.orders;
CREATE POLICY "Orders can be created from storefront" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (jsonb_typeof(items) = 'array');
CREATE POLICY "Signed in users manage orders" ON public.orders
  FOR ALL TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Signed in users manage site settings" ON public.site_settings;
CREATE POLICY "Signed in users manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Signed in users manage hero slides" ON public.hero_slides;
CREATE POLICY "Signed in users manage hero slides" ON public.hero_slides
  FOR ALL TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Signed in users manage category tiles" ON public.category_tiles;
CREATE POLICY "Signed in users manage category tiles" ON public.category_tiles
  FOR ALL TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Signed in users manage blog posts" ON public.blog_posts;
CREATE POLICY "Signed in users manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Signed in users manage store locations" ON public.store_locations;
CREATE POLICY "Signed in users manage store locations" ON public.store_locations
  FOR ALL TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

NOTIFY pgrst, 'reload schema';