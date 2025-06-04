/*
  # Remove users table
  
  1. Changes
    - Drop the users table and all its associated policies
    - Remove foreign key constraint from users table
*/

-- Drop all policies first
DROP POLICY IF EXISTS "Administrators can create user profiles" ON public.users;
DROP POLICY IF EXISTS "Administrators can manage all users" ON public.users;
DROP POLICY IF EXISTS "Enable full access for administrators" ON public.users;
DROP POLICY IF EXISTS "New users can create their profile" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;

-- Drop the users table
DROP TABLE IF EXISTS public.users;