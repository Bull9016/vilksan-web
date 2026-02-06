-- Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trending boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
