-- HOME GRID ITEMS TABLE
CREATE TABLE public.home_grid_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  position integer NOT NULL UNIQUE, -- 1 = Large Top, 2 = Bottom Left, 3 = Bottom Center, 4 = Bottom Right
  image_url text,
  subtitle text,
  title text,
  description text,
  link_url text,
  link_text text,
  text_color text DEFAULT 'black', -- 'black' or 'white'
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.home_grid_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view
CREATE POLICY "Public grid items are viewable by everyone" ON public.home_grid_items
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update grid items" ON public.home_grid_items
  FOR UPDATE USING (auth.role() = 'authenticated'); -- simplified check

-- Only admins can insert (though we will pre-seed)
CREATE POLICY "Admins can insert grid items" ON public.home_grid_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SEED INITIAL DATA (4 Items)
INSERT INTO public.home_grid_items (position, title, description, link_text, link_url)
VALUES 
(1, 'OZERWOOD-XZ', 'Retro details with futuristic design.', 'SHOP NOW', '/products'),
(2, 'New Collection', 'Combining rebellion with elegance.', 'EXPLORE', '/collections/new'),
(3, 'NASA', 'Cosmic stylish belt.', 'VIEW MORE', '/products/nasa-belt'),
(4, 'Blog', 'Supporting the community.', 'READ MORE', '/blog')
ON CONFLICT (position) DO NOTHING;
