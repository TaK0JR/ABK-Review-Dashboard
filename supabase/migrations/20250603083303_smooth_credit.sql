/*
  # Secure password storage implementation
  
  1. Changes
    - Add function to hash passwords securely using pgcrypto
    - Add trigger to automatically hash passwords on insert/update
    - Update existing passwords to be hashed
*/

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.password <> OLD.password THEN
    NEW.password = crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically hash passwords
DROP TRIGGER IF EXISTS hash_password_trigger ON auth;
CREATE TRIGGER hash_password_trigger
  BEFORE INSERT OR UPDATE ON auth
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- Update existing passwords to be hashed
-- Only run this if passwords aren't already hashed
DO $$ 
BEGIN
  UPDATE auth 
  SET password = crypt(password, gen_salt('bf'))
  WHERE password NOT LIKE '$2a$%';  -- Only update if not already bcrypt hashed
END $$;