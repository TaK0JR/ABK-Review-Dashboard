/*
  # Create form tables for users
  
  1. New Functions
    - create_form_table: Creates a form table for a specific user
    - handle_new_user_form: Trigger function to create form table for new users
    
  2. Changes
    - Creates form tables for each user with proper RLS policies
    - Sets up automatic table creation for new users
    - Creates tables for existing users
*/

-- Function to create a form table for a user
CREATE OR REPLACE FUNCTION create_form_table(user_email text)
RETURNS void AS $$
DECLARE
    table_name text;
BEGIN
    -- Create a valid table name from the email (remove special characters and spaces)
    table_name := 'forms_' || regexp_replace(
        lower(split_part(user_email, '@', 1)),
        '[^a-z0-9]',
        '_',
        'g'
    );

    -- Create the forms table for this user
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            description text,
            questions jsonb NOT NULL CHECK (
                jsonb_array_length(questions) <= 3 AND
                jsonb_typeof(questions) = ''array'' AND
                (
                    SELECT bool_and(
                        (value ->> ''type'') IN (''note'', ''smileys'', ''text'') AND
                        (value ->> ''text'') IS NOT NULL AND
                        jsonb_typeof(value -> ''required'') = ''boolean''
                    )
                    FROM jsonb_array_elements(questions)
                )
            ),
            settings jsonb CHECK (
                jsonb_typeof(settings) = ''object'' AND
                (settings ? ''logoUrl'') AND
                (settings ? ''bannerUrl'') AND
                (settings ? ''primaryColor'') AND
                (settings ? ''backgroundColor'') AND
                (settings ? ''redirectLowScore'') AND
                (settings ? ''redirectHighScore'')
            ),
            public_url text GENERATED ALWAYS AS (
                ''abk-review.com/form/'' || 
                lower(regexp_replace(name, ''[^a-zA-Z0-9]'', ''-'', ''g''))
            ) STORED,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        )', table_name
    );

    -- Enable RLS on the new table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

    -- Drop existing policies if they exist
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own forms" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Administrators can view all forms" ON %I', table_name);

    -- Create policy to allow the user to manage their own forms
    EXECUTE format('
        CREATE POLICY "Users can manage their own forms" ON %I
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

    -- Create policy for admins to view all forms
    EXECUTE format('
        CREATE POLICY "Administrators can view all forms" ON %I
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

    -- Drop existing trigger if it exists
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', table_name, table_name);

    -- Create updated_at trigger
    EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    ', table_name, table_name);

    -- Add example of the expected JSON structure as a comment
    EXECUTE format('
        COMMENT ON TABLE %I IS ''Form table for user %s
Example questions JSON:
[
  {
    "text": "How would you rate your experience?",
    "type": "note",
    "required": true
  },
  {
    "text": "How satisfied are you?",
    "type": "smileys",
    "required": false
  },
  {
    "text": "Any additional comments?",
    "type": "text",
    "required": false
  }
]

Example settings JSON:
{
  "logoUrl": "https://example.com/logo.png",
  "bannerUrl": "https://example.com/banner.jpg",
  "primaryColor": "#3366FF",
  "backgroundColor": "#F7F9FC",
  "redirectLowScore": "https://facebook.com/my-page",
  "redirectHighScore": "https://g.page/r/my-business"
}''', table_name, user_email);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create form table when new user is created
CREATE OR REPLACE FUNCTION handle_new_user_form()
RETURNS TRIGGER AS $$
BEGIN
    -- Create form table for the new user
    PERFORM create_form_table(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth table
DROP TRIGGER IF EXISTS create_form_table_trigger ON auth;
CREATE TRIGGER create_form_table_trigger
    AFTER INSERT ON auth
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_form();

-- Create form tables for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT email FROM auth LOOP
        PERFORM create_form_table(user_record.email);
    END LOOP;
END $$;