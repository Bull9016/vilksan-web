-- Newsletter Subscribers Table
create table if not exists public.subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.subscribers enable row level security;

-- Allow public to subscribe (insert only)
drop policy if exists "Public can subscribe" on public.subscribers;
create policy "Public can subscribe" on public.subscribers for insert with check (true);

-- Only admins can view subscribers
drop policy if exists "Admins can view subscribers" on public.subscribers;
create policy "Admins can view subscribers" on public.subscribers for select using (auth.role() = 'authenticated');
