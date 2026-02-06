-- Enable Extensions
create extension if not exists "uuid-ossp";

-- 1. COLLECTIONS TABLE
create table if not exists public.collections (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  image text, -- Cloudinary URL for banner
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. UPDATE PRODUCTS TABLE
alter table public.products 
add column if not exists collection_id uuid references public.collections(id),
add column if not exists details text, -- Rich text for "Product Details" accordion
add column if not exists fabric_care text, -- "100% Cotton, Machine Wash Cold"
add column if not exists shipping_info text default 'Free shipping on orders over $100. Returns within 14 days.',
add column if not exists featured boolean default false,
add column if not exists trending boolean default false,
add column if not exists bg_text text;

-- 3. PRODUCT VARIANTS TABLE (Size/Color/Stock)
create table if not exists public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  size text, -- "S", "M", "L", "XL", "US 10", etc.
  color text, -- "Black", "Off-White"
  color_code text, -- Hex code for visual dot: "#000000"
  stock integer default 0,
  sku text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RLS POLICIES

-- Collections
alter table public.collections enable row level security;

drop policy if exists "Public collections are viewable by everyone" on public.collections;
create policy "Public collections are viewable by everyone" on public.collections for select using (true);

drop policy if exists "Admins can insert collections" on public.collections;
create policy "Admins can insert collections" on public.collections for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admins can update collections" on public.collections;
create policy "Admins can update collections" on public.collections for update using (auth.role() = 'authenticated');

drop policy if exists "Admins can delete collections" on public.collections;
create policy "Admins can delete collections" on public.collections for delete using (auth.role() = 'authenticated');

-- Variants
alter table public.product_variants enable row level security;

drop policy if exists "Public variants are viewable by everyone" on public.product_variants;
create policy "Public variants are viewable by everyone" on public.product_variants for select using (true);

drop policy if exists "Admins can manage variants" on public.product_variants;
create policy "Admins can manage variants" on public.product_variants for all using (auth.role() = 'authenticated');
