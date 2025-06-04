/*
  # Fix RLS policies for forms tables

  1. Changes
    - Add proper RLS policies for forms tables to allow authenticated users to:
      - Insert their own forms
      - View their own forms
      - Manage their own forms
    - Enable RLS on forms tables if not already enabled

  2. Security
    - Ensures users can only access their own forms
    - Administrators can view all forms
    - Forms are properly secured with RLS
*/

-- Function to extract username from email
CREATE OR REPLACE FUNCTION get_username_from_email(email text)
RETURNS text AS $$
BEGIN
  RETURN split_part(email, '@', 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get forms table name for current user
CREATE OR REPLACE FUNCTION get_user_forms_table()
RETURNS text AS $$
DECLARE
  username text;
BEGIN
  -- Get username from current user's email
  username := get_username_from_email(current_user);
  -- Return the forms table name
  RETURN 'forms_' || username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns the forms table
CREATE OR REPLACE FUNCTION check_forms_table_ownership(table_name text)
RETURNS boolean AS $$
DECLARE
  username text;
BEGIN
  -- Get username from current user's email
  username := get_username_from_email(current_user);
  -- Check if table name matches user's forms table
  RETURN table_name = 'forms_' || username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all forms tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'forms_%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "Users can create their own forms in %I" ON %I', 
      split_part(table_name, '_', 2), 
      table_name
    );
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own forms" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Administrators can view all forms" ON %I', table_name);
    
    -- Create new policies
    -- Allow users to insert into their own forms table
    EXECUTE format(
      'CREATE POLICY "Users can create their own forms in %I" ON %I
       FOR INSERT 
       TO authenticated
       WITH CHECK (
         check_forms_table_ownership(%L)
       )',
      split_part(table_name, '_', 2),
      table_name,
      table_name
    );
    
    -- Allow users to manage their own forms
    EXECUTE format(
      'CREATE POLICY "Users can manage their own forms" ON %I
       FOR ALL
       TO authenticated
       USING (check_forms_table_ownership(%L))
       WITH CHECK (check_forms_table_ownership(%L))',
      table_name,
      table_name,
      table_name
    );
    
    -- Allow administrators to view all forms
    EXECUTE format(
      'CREATE POLICY "Administrators can view all forms" ON %I
       FOR SELECT
       TO authenticated
       USING (
         EXISTS (
           SELECT 1 FROM auth
           WHERE auth.email = current_user
           AND auth.is_admin = true
         )
       )',
      table_name
    );
  END LOOP;
END
$$;