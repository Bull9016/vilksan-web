-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PRODUCTS TABLE
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2) not null,
  bg_text text, -- Text shown dynamically behind the product
  media text[], -- Array of image URLs (Cloudinary)
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BLOGS TABLE
create table public.blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  excerpt text,
  content jsonb, -- Rich text content
  cover_image text,
  media text[], -- Additional images/videos
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount decimal(10,2) not null,
  items jsonb not null, -- Stores snapshot of ordered items
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTENT BLOCKS (For Generic Page Content)
create table public.content_blocks (
  key text primary key, -- Unique identifier like 'home_hero_title'
  value text, -- The text content
  type text default 'text', -- 'text', 'image', 'video'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Products: Everyone can view, only admin can edit
alter table public.products enable row level security;
create policy "Public products are viewable by everyone" on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert with check (auth.role() = 'authenticated'); -- Simplified for demo
create policy "Admins can update products" on public.products for update using (auth.role() = 'authenticated');

-- Blogs: Everyone can view, only admin can edit
alter table public.blogs enable row level security;
create policy "Public blogs are viewable by everyone" on public.blogs for select using (true);
create policy "Admins can insert blogs" on public.blogs for insert with check (auth.role() = 'authenticated');
create policy "Admins can update blogs" on public.blogs for update using (auth.role() = 'authenticated');

-- Content Blocks: Everyone can view, only admin can edit
alter table public.content_blocks enable row level security;
create policy "Content is viewable by everyone" on public.content_blocks for select using (true);
create policy "Admins can update content" on public.content_blocks for update using (auth.role() = 'authenticated');
create policy "Admins can insert content" on public.content_blocks for insert with check (auth.role() = 'authenticated');
