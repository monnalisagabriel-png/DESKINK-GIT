-- Check policies on public.users
select * from pg_policies wheretablename = 'users';

-- Check if RLS is enabled on users
select relname, relrowsecurity from pg_class where relname = 'users';
