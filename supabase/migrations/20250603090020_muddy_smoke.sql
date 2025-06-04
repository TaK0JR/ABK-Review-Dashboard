/*
  # Create client tables for users
  
  1. New Functions
    - create_client_table: Creates a client table for a specific user
    - handle_new_user: Trigger function to create client table for new users
    
  2. Changes
    - Creates client tables for each user with proper RLS policies
    - Sets up automatic table creation for new users
    - Creates tables for existing users
*/

-- Function to create a client table for a user
CREATE OR REPLACE FUNCTION create_client_table(user_email text)
RETURNS void AS $$
DECLARE
    table_name text;
BEGIN
    -- Create a valid table name from the email (remove special characters and spaces)
    table_name := 'clients_' || regexp_replace(
        lower(split_part(user_email, '@', 1)),
        '[^a-z0-9]',
        '_',
        'g'
    );

    -- Create the clients table for this user
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name text NOT NULL,
            email text,
            phone text,
            company_name text,
            review_score integer,
            review_comment text,
            review_date timestamptz,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        )', table_name
    );

    -- Enable RLS on the new table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

    -- Create policy to allow the user to manage their own clients
    EXECUTE format('
        CREATE POLICY "Users can manage their own clients" ON %I
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM auth
                WHERE email = current_user
                AND email = %L
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM auth
                WHERE email = current_user
                AND email = %L
            )
        )
    ', table_name, user_email, user_email);

    -- Create policy for admins to view all clients
    EXECUTE format('
        CREATE POLICY "Administrators can view all clients" ON %I
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM auth
                WHERE email = current_user
                AND is_admin = true
            )
        )
    ', table_name);

    -- Create updated_at trigger
    EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create client table when new user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create client table for the new user
    PERFORM create_client_table(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth table
DROP TRIGGER IF EXISTS create_client_table_trigger ON auth;
CREATE TRIGGER create_client_table_trigger
    AFTER INSERT ON auth
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create client tables for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT email FROM auth LOOP
        PERFORM create_client_table(user_record.email);
    END LOOP;
END $$;