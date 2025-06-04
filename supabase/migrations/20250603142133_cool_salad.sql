/*
  # Add RLS policies for auth table

  1. Changes
    - Enable RLS on auth table
    - Add policies for CRUD operations on auth table
    
  2. Security
    - Allows anon role to perform operations on auth table
    - Required for direct database authentication approach
    - Note: This is a specific implementation as requested, bypassing Supabase Auth
*/

-- Enable RLS
ALTER TABLE auth ENABLE ROW LEVEL SECURITY;

-- Allow SELECT operations for login and admin functions
CREATE POLICY "Allow anon read access to auth table"
ON auth
FOR SELECT
TO anon
USING (true);

-- Allow INSERT operations for user creation
CREATE POLICY "Allow anon insert into auth table"
ON auth
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow UPDATE operations for admin functions
CREATE POLICY "Allow anon update on auth table"
ON auth
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow DELETE operations for admin functions
CREATE POLICY "Allow anon delete from auth table"
ON auth
FOR DELETE
TO anon
USING (true);