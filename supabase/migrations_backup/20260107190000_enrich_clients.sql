-- Add missing columns to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS fiscal_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_styles TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS whatsapp_broadcast_opt_in BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows updating these columns (usually implicit if ALL/UPDATE policies exist)
-- The existing policy "Isolate clients by studio" handles ALL operations, so no change needed.
