-- 1. PUBLIC PROFILES TABLE
-- This table mirrors auth.users to store additional user data if needed (e.g. avatar, phone)
-- and allows public access to user info where appropriate.
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. CARTS TABLE
-- Each user has one active cart.
CREATE TABLE public.carts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE, -- One cart per user
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CART ITEMS TABLE
-- Stores individual items in a cart.
CREATE TABLE public.cart_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cart_id uuid REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  variant_id uuid REFERENCES public.product_variants(id), -- Optional, IF you have variants table
  quantity int DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
  -- Unique constraint to prevent duplicate rows for same product/variant in same cart
  -- UNIQUE(cart_id, product_id, variant_id) -- (Optional: enable if variant_id is handle correctly for nulls)
);


-- 4. UPDATE ORDERS TABLE (Security & Ownership)
-- Ensure RLS is enabled and policies exist so users only see THEIR orders.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create orders (checkout)
-- We strictly enforce that they can only insert orders where user_id is their own ID.
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 5. RLS FOR PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- 6. RLS FOR CARTS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Users can view/create their own cart
CREATE POLICY "Users can view own cart" ON public.carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cart" ON public.carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. RLS FOR CART ITEMS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can CRUD items in their own cart (via cart_id join check or trusting app logic if cart RLS checks out)
-- A more robust SQL policy often requires a join, which can be expensive, or relying on the 'carts' policy cascading if we insert.
-- For simplicity and performance, we often check if the cart belongs to the user:

CREATE POLICY "Users can view cart items" ON public.cart_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE id = cart_items.cart_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cart items" ON public.cart_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE id = cart_items.cart_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cart items" ON public.cart_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE id = cart_items.cart_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cart items" ON public.cart_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE id = cart_items.cart_id
      AND user_id = auth.uid()
    )
  );
