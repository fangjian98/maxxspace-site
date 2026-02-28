-- Enable Admin Management Policies
-- Run this in your Supabase SQL Editor to allow admins to manage other users

-- 1. Allow admins to update any profile (e.g. promote/demote)
create policy "Allow admin update all profiles"
  on public.profiles for update
  using ( is_admin() );

-- 2. Allow admins to delete any profile
create policy "Allow admin delete all profiles"
  on public.profiles for delete
  using ( is_admin() );

-- Note: Deleting a profile from the 'public' schema does NOT delete the user from 'auth.users'.
-- To fully delete a user, you typically need to use the Supabase Management API (server-side).
-- However, removing their profile is effective for disabling their access to app features.
