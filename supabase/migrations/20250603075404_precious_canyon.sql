/*
  # Create authentication functions
  
  1. New Functions
    - verify_password: Verifies if an input password matches a hashed password
*/

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(
  input_password text,
  hashed_password text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN hashed_password = crypt(input_password, hashed_password);
END;
$$;