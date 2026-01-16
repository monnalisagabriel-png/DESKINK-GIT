-- Enable Realtime for critical tables
begin;

  -- Add appointments table to the publication
  alter publication supabase_realtime add table appointments;

  -- Add clients table to the publication
  alter publication supabase_realtime add table clients;

commit;
