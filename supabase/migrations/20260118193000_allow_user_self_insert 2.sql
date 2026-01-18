-- Allow users to insert their own profile into public.users
-- This is a fallback in case the trigger fails or for legacy users.

-- Enable RLS just in case (it likely is already)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow INSERT if id matches auth.uid()
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure we don't have conflicts with existing policies
-- (Assuming standard 'Users can update their own profile' exists, but INSERT might be missing)
