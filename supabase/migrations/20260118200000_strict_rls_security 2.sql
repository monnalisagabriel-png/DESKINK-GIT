-- Strict RLS Security for Payment Gating
-- 1. Create a helper function to check if a studio is active
-- This function will be used in RLS policies to block access to unpaid studios.

CREATE OR REPLACE FUNCTION public.is_studio_active(studio_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.studios s
    WHERE s.id = studio_id
    AND (
      s.subscription_status = 'active' 
      OR s.subscription_status = 'trialing'
    )
  );
$$;

-- 2. Update Critical Tables to enforce this check
-- We'll assume existing policies allow access based on studio_id membership.
-- We append "AND is_studio_active(studio_id)" to them.

-- Since modifying potential existing policies blindly is risky, we'll CREATE new restrictive policies
-- or ensuring the check is applied. 
-- A safer approach for this migration is to creating a wrap-around policy or just adding it to specific ones.
-- However, standard practice is to rely on the "studio_memberships" check, so we can update THAT check or add a new one.

-- Let's add a policy to 'appointments' specifically as a test case and critical data.
-- If we want to be global, we should update the core RLS helper if it existed, but we don't have one.
-- So we will add a specific RESTRICTIVE policy (new Postgres feature) or just standard policies.
-- Postgres 10+ supports only PERMISSIVE policies by default (OR logic). 
-- To ENFORCE (AND logic), we need to ensure the existing policy includes it, OR use "AS RESTRICTIVE" if on PG 15+.
-- Supabase is typically PG 15+.

-- Let's try creating a RESTRICTIVE policy.
-- If the DB version supports it, this is the cleanest way: "Access granted ONLY IF is_active".

CREATE POLICY "Enforce active subscription for appointments"
ON public.appointments
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  public.is_studio_active(studio_id)
);

CREATE POLICY "Enforce active subscription for clients"
ON public.clients
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  public.is_studio_active(studio_id)
);

CREATE POLICY "Enforce active subscription for financials"
ON public.transactions
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  public.is_studio_active(studio_id)
);

-- Note: We do NOT apply this to 'studios' table itself, otherwise they can't read their own status to pay!
-- We do NOT apply to 'studio_memberships' so they can check if they are members (and see the blocking screen).
