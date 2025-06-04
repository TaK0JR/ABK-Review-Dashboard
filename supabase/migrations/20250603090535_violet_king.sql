/*
  # Add RPC function for admin user creation

  1. New Functions
    - `create_admin_user`: RPC function to create new users with admin privileges
      - Parameters:
        - p_email (text)
        - p_password (text)
        - p_full_name (text)
        - p_company_name (text)
        - p_is_admin (boolean)
      
  2. Security
    - Function runs with SECURITY DEFINER privileges
    - Only authenticated users with admin privileges can execute the function
*/

CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_company_name TEXT,
  p_is_admin BOOLEAN
) RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM auth 
    WHERE email = auth.email() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can create new users';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  -- Insert new user
  INSERT INTO auth (
    email,
    password,
    full_name,
    company_name,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    p_password,
    p_full_name,
    p_company_name,
    p_is_admin,
    now(),
    now()
  ) RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;