-- Add status column to blogs table
ALTER TABLE public.blogs ADD COLUMN status text DEFAULT 'Draft';

-- Update RLS for blogs to allow public to view only published, but for now we set to true for dev
DROP POLICY IF EXISTS "Public blogs are viewable by everyone" ON public.blogs;
CREATE POLICY "Public blogs are viewable by everyone" ON public.blogs FOR SELECT USING (true);
