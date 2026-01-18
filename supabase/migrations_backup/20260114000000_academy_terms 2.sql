-- Add Academy Terms fields to studios and users
-- Date: 2026-01-14

-- 1. Add academy_terms to studios table
ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS academy_terms TEXT,
ADD COLUMN IF NOT EXISTS academy_terms_version INTEGER DEFAULT 0;

-- 2. Add acceptance tracking to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS academy_terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS academy_terms_accepted_version INTEGER DEFAULT 0;

-- 3. Policy update (ensure users can update their own acceptance status)
-- Already covered by "Update self" policy on public.users, but verifying RLS isn't blocking.
-- Existing policy: "Update self" ON public.users FOR UPDATE USING (auth.uid() = id);
-- This is sufficient.

-- 4. Policy for studios (Owners need to update terms)
-- Existing policy: "Manage own studios" (if any) or generic update policy.
-- Let's ensure owners can update their studio.

DROP POLICY IF EXISTS "Owners can update their studio" ON public.studios;
CREATE POLICY "Owners can update their studio" ON public.studios
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = studios.id AND role = 'owner')
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = studios.id AND role = 'owner')
  );
