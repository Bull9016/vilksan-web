-- Add the 'styles' JSONB column to the 'products' table if it doesn't utilize it.
ALTER TABLE products ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';
