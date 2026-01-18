-- Hotfix: Relax RLS on Data Tables to debug Realtime
-- If Realtime works after this, we know the issue was the subquery policy.

-- Appointments
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Hotfix: View all appointments" ON public.appointments;

CREATE POLICY "Hotfix: View all appointments" ON public.appointments
  FOR SELECT USING (true);

-- Clients
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Hotfix: View all clients" ON public.clients;

CREATE POLICY "Hotfix: View all clients" ON public.clients
  FOR SELECT USING (true);
