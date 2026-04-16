-- Add currency column to organizations table
ALTER TABLE IF EXISTS public.organizations 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT '₹';

-- Update existing organizations to have the default currency if they don't already
UPDATE public.organizations 
SET currency = '₹' 
WHERE currency IS NULL;
