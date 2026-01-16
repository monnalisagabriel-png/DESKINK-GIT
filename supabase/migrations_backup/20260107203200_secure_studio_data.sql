-- Migration to secure studio data isolation
-- Date: 2026-01-07

-- 1. APPOINTMENTS
DROP POLICY IF EXISTS "Enable all for appointments" ON public.appointments;

DROP POLICY IF EXISTS "View appointments from own studio" ON public.appointments;
CREATE POLICY "View appointments from own studio" ON public.appointments
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = appointments.studio_id)
  );

DROP POLICY IF EXISTS "Create appointments in own studio" ON public.appointments;
CREATE POLICY "Create appointments in own studio" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = appointments.studio_id)
  );

DROP POLICY IF EXISTS "Update own studio appointments" ON public.appointments;
CREATE POLICY "Update own studio appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = appointments.studio_id)
  );

DROP POLICY IF EXISTS "Delete own studio appointments" ON public.appointments;
CREATE POLICY "Delete own studio appointments" ON public.appointments
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = appointments.studio_id)
  );


-- 2. CLIENTS
DROP POLICY IF EXISTS "Enable all for clients" ON public.clients;

DROP POLICY IF EXISTS "View clients from own studio" ON public.clients;
CREATE POLICY "View clients from own studio" ON public.clients
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = clients.studio_id)
  );

DROP POLICY IF EXISTS "Manage clients in own studio" ON public.clients;
CREATE POLICY "Manage clients in own studio" ON public.clients
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = clients.studio_id)
  );


-- 3. TRANSACTIONS
DROP POLICY IF EXISTS "Enable all for transactions" ON public.transactions;

DROP POLICY IF EXISTS "View transactions from own studio" ON public.transactions;
CREATE POLICY "View transactions from own studio" ON public.transactions
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = transactions.studio_id)
  );

DROP POLICY IF EXISTS "Manage transactions in own studio" ON public.transactions;
CREATE POLICY "Manage transactions in own studio" ON public.transactions
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = transactions.studio_id)
  );


-- 4. RECURRING EXPENSES
-- Assuming previously no policy or restrictive
DROP POLICY IF EXISTS "Enable all for recurring_expenses" ON public.recurring_expenses; -- Just in case

CREATE POLICY "Manage recurring_expenses in own studio" ON public.recurring_expenses
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = recurring_expenses.studio_id)
  );


-- 5. ARTIST CONTRACTS
-- Artists should see their own contract. Owners/Managers should see contracts for their studio.
DROP POLICY IF EXISTS "Enable all for artist_contracts" ON public.artist_contracts;

DROP POLICY IF EXISTS "View own contract or studio contracts" ON public.artist_contracts;
CREATE POLICY "View own contract or studio contracts" ON public.artist_contracts
  FOR SELECT USING (
    auth.uid() = artist_id OR
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = artist_contracts.studio_id AND role IN ('owner', 'manager'))
  );

DROP POLICY IF EXISTS "Manage contracts (Managers/Owners)" ON public.artist_contracts;
CREATE POLICY "Manage contracts (Managers/Owners)" ON public.artist_contracts
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = artist_contracts.studio_id AND role IN ('owner', 'manager'))
  );


-- 6. WAITLIST ENTRIES
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.waitlist_entries;

DROP POLICY IF EXISTS "Manage waitlist in own studio" ON public.waitlist_entries;
CREATE POLICY "Manage waitlist in own studio" ON public.waitlist_entries
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = waitlist_entries.studio_id)
  );
