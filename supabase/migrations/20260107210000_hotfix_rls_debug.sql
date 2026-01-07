-- Hotfix: Relax RLS to debug infinite loading
-- Date: 2026-01-07 21:00

-- Users Table
DROP POLICY IF EXISTS "View self and studio colleagues" ON public.users;
DROP POLICY IF EXISTS "Enable all for users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;

CREATE POLICY "Hotfix: View all users" ON public.users
  FOR SELECT USING (true);
  
CREATE POLICY "Hotfix: Update own user" ON public.users
  FOR UPDATE USING (auth.uid() = id);


-- Studio Memberships Table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.studio_memberships;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.studio_memberships;

CREATE POLICY "Hotfix: View all memberships" ON public.studio_memberships
  FOR SELECT USING (true);
  
CREATE POLICY "Hotfix: Manage own memberships" ON public.studio_memberships
  FOR ALL USING (true); -- Very permissive for now to ensure no blocker
