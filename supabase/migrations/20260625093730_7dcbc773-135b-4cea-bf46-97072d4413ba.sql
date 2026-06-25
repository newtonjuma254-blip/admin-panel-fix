CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '60s',
  image text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  badge_tag text NOT NULL DEFAULT 'NEW',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.products TO anon, authenticated, service_role;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  image_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.categories TO anon, authenticated, service_role;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  total numeric NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.orders TO anon, authenticated, service_role;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.site_settings TO anon, authenticated, service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site settings are public" ON public.site_settings;
DROP POLICY IF EXISTS "Signed in users manage site settings" ON public.site_settings;
CREATE POLICY "Site settings are public" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed in users manage site settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  url text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.hero_slides TO anon, authenticated, service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hero slides are public" ON public.hero_slides;
DROP POLICY IF EXISTS "Signed in users manage hero slides" ON public.hero_slides;
CREATE POLICY "Hero slides are public" ON public.hero_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed in users manage hero slides" ON public.hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.category_tiles (
  category text PRIMARY KEY,
  image_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.category_tiles TO anon, authenticated, service_role;
ALTER TABLE public.category_tiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Category tiles are public" ON public.category_tiles;
DROP POLICY IF EXISTS "Signed in users manage category tiles" ON public.category_tiles;
CREATE POLICY "Category tiles are public" ON public.category_tiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed in users manage category tiles" ON public.category_tiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.blog_posts TO anon, authenticated, service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Blog posts are public" ON public.blog_posts;
DROP POLICY IF EXISTS "Signed in users manage blog posts" ON public.blog_posts;
CREATE POLICY "Blog posts are public" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed in users manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.store_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  place text NOT NULL DEFAULT '',
  phones text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON public.store_locations TO anon, authenticated, service_role;
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Store locations are public" ON public.store_locations;
DROP POLICY IF EXISTS "Signed in users manage store locations" ON public.store_locations;
CREATE POLICY "Store locations are public" ON public.store_locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed in users manage store locations" ON public.store_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER set_hero_slides_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (name, category, price, duration, badge_tag, description, image, image_url, video_url) VALUES
  ('Skyline Apex 200', 'Display Fireworks', 48000, '180s', 'PRO', 'Professional aerial display with 200 shots of layered comets and peonies.', 'p-mega.jpg', '', ''),
  ('Aurora Cake 100', 'Medium Fireworks', 12500, '90s', 'BESTSELLER', '100-shot multi-colour cake, perfect for medium gardens.', 'p-cake.jpg', '', ''),
  ('Pocket Comet', 'Small Fireworks', 1800, '20s', 'NEW', 'Compact comet pack for balconies and small yards.', 'p-rocket.jpg', '', ''),
  ('Neon Party Pack', 'Party Supplies', 3200, '—', 'NEW', 'Glow bracelets, hats, and table confetti for 20 guests.', 'p-shell.jpg', '', ''),
  ('LED Festoon String 20m', 'Decorative Lighting', 5400, '—', 'BESTSELLER', 'Warm-white festoon for outdoor venues.', 'p-fountain.jpg', '', ''),
  ('CO2 Smoke Gun', 'Club Accessories', 7900, '—', 'PRO', 'Pro-grade CO2 jet for clubs and stages.', 'p-candle.jpg', '', ''),
  ('Wedding Sparkler Send-off (50pc)', 'Event Services', 9500, '—', 'LIMITED', 'On-site team plus 50 premium 60cm sparklers.', 'p-sparkler.jpg', '', ''),
  ('Glow Body Paint Set', 'Glow in the Dark', 2400, '—', 'NEW', 'UV-reactive body paints in 8 colours.', 'p-candle.jpg', '', ''),
  ('Spooky Smoke Pumpkin', 'Halloween', 1500, '60s', 'LIMITED', 'Cold smoke effect inside a carved pumpkin.', 'p-shell.jpg', '', ''),
  ('Silver Fountain 60s', 'Fountains & Sparklers', 1200, '60s', 'BESTSELLER', 'Classic silver fountain with indoor-safe variants available.', 'p-fountain.jpg', '', '')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name) VALUES
  ('Display Fireworks'), ('Medium Fireworks'), ('Small Fireworks'), ('Party Supplies'),
  ('Decorative Lighting'), ('Club Accessories'), ('Event Services'), ('Glow in the Dark'),
  ('Halloween'), ('Fountains & Sparklers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.category_tiles (category) VALUES
  ('Display Fireworks'), ('Medium Fireworks'), ('Small Fireworks'), ('Party Supplies'),
  ('Decorative Lighting'), ('Club Accessories'), ('Event Services'), ('Glow in the Dark'),
  ('Halloween'), ('Fountains & Sparklers')
ON CONFLICT (category) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('logo_url', ''),
  ('hero_title', 'Light Up The Nairobi Night'),
  ('hero_subtitle', 'Premium fireworks, sparklers, and event lighting — curated for unforgettable nights.'),
  ('whatsapp_number', '254700000000')
ON CONFLICT (key) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_slides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.category_tiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_locations;

NOTIFY pgrst, 'reload schema';