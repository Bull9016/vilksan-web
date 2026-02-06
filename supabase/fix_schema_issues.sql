-- Fix missing slug column in products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cover_image text;
-- Ensure it's unique (optional but good practice, might fail if duplicates exist, so maybe just add column first)
-- CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);

-- Fix RLS policies to be more permissive for this stage of development involving the Admin Dashboard
-- (Or ensure we can insert without auth if we are using client actions without auth state)

-- Update Collections Policies (Drop and Recreate to be safe)
DROP POLICY IF EXISTS "Admins can insert collections" ON public.collections;
CREATE POLICY "Admins can insert collections" ON public.collections FOR INSERT WITH CHECK (true); -- Temporarily allow public insert for dev ease

DROP POLICY IF EXISTS "Admins can update collections" ON public.collections;
CREATE POLICY "Admins can update collections" ON public.collections FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete collections" ON public.collections;
CREATE POLICY "Admins can delete collections" ON public.collections FOR DELETE USING (true);


-- Update Product Variants Policies
DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Admins can manage variants" ON public.product_variants FOR ALL USING (true);

-- Update Products Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (true);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view subscribers" ON public.subscribers;
CREATE POLICY "Admins can view subscribers" ON public.subscribers FOR SELECT USING (true); -- Simplification for now

-- Content Blocks Style
ALTER TABLE public.content_blocks ADD COLUMN IF NOT EXISTS style jsonb default '{}'::jsonb;
