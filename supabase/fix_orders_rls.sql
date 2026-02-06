-- Enable RLS (just in case)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public users to create orders
-- This is required because we are using the public API client without user auth for the "Buy Now" button
DROP POLICY IF EXISTS "Public can manage orders" ON public.orders;

CREATE POLICY "Public can manage orders" ON public.orders
    FOR ALL
    USING (true)
    WITH CHECK (true);
