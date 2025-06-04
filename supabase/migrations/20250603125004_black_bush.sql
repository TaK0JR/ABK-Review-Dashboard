/*
  # Fix authentication permissions and user creation

  1. Changes
    - Grant necessary permissions to the anon role
    - Create secure function for user creation
    - Enable row level security on auth table
    - Add policies for admin access

  2. Security
    - Only authenticated admins can view all users
    - Password hashing is handled by trigger
    - Secure RPC function for user creation
*/

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.auth TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Enable RLS on auth table if not already enabled
ALTER TABLE public.auth ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all users
CREATE POLICY "Admins can view all users"
  ON public.auth
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auth AS a
      WHERE a.email = current_user
      AND a.is_admin = true
    )
  );

-- Create secure function for user creation
CREATE OR REPLACE FUNCTION public.create_new_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_company_name TEXT,
  p_is_admin BOOLEAN
)
RETURNS public.auth
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user public.auth;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.auth
    WHERE email = current_user
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can create new users';
  END IF;

  -- Insert new user
  INSERT INTO public.auth (
    email,
    password,
    full_name,
    company_name,
    is_admin
  ) VALUES (
    p_email,
    p_password, -- Will be hashed by the existing hash_password trigger
    p_full_name,
    p_company_name,
    p_is_admin
  )
  RETURNING * INTO new_user;

  RETURN new_user;
END;
$$;