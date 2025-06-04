/*
  # Create form tables for users
  
  1. Changes
    - Create function to generate form tables for users
    - Add proper JSON validation for questions and settings
    - Create policies for access control
    - Handle existing tables gracefully
*/

-- Function to create a form table for a user
CREATE OR REPLACE FUNCTION create_form_table(user_email text)
RETURNS void AS $$
DECLARE
    table_name text;
BEGIN
    -- Create a valid table name from the email
    table_name := 'forms_' || regexp_replace(
        lower(split_part(user_email, '@', 1)),
        '[^a-z0-9]',
        '_',
        'g'
    );

    -- Drop existing objects to avoid conflicts
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name);

    -- Create the forms table with proper constraints
    EXECUTE format('
        CREATE TABLE %I (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            description text,
            questions jsonb NOT NULL CHECK (
                jsonb_array_length(questions) <= 3 AND
                jsonb_typeof(questions) = ''array''
            ),
            settings jsonb NOT NULL CHECK (
                jsonb_typeof(settings) = ''object'' AND
                (settings ->> ''logoUrl'') IS NOT NULL AND
                (settings ->> ''bannerUrl'') IS NOT NULL AND
                (settings ->> ''primaryColor'') ~ ''^#[0-9A-Fa-f]{6}$'' AND
                (settings ->> ''backgroundColor'') ~ ''^#[0-9A-Fa-f]{6}$'' AND
                (settings ->> ''redirectLowScore'') ~ ''^https?://'' AND
                (settings ->> ''redirectHighScore'') ~ ''^https?://''
            ),
            public_url text GENERATED ALWAYS AS (
                ''abk-review.com/form/'' || 
                lower(regexp_replace(name, ''[^a-zA-Z0-9]'', ''-'', ''g''))
            ) STORED,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        )', table_name
    );

    -- Create a trigger function to validate questions
    EXECUTE format('
        CREATE OR REPLACE FUNCTION validate_questions_%I()
        RETURNS trigger AS $func$
        DECLARE
            question jsonb;
        BEGIN
            FOR question IN SELECT * FROM jsonb_array_elements(NEW.questions) LOOP
                IF NOT (
                    (question ->> ''type'') IN (''note'', ''smileys'', ''text'') AND
                    (question ->> ''text'') IS NOT NULL AND
                    jsonb_typeof(question -> ''required'') = ''boolean''
                ) THEN
                    RAISE EXCEPTION ''Invalid question format'';
                END IF;
            END LOOP;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    ', table_name);

    -- Create trigger for question validation
    EXECUTE format('
        CREATE TRIGGER validate_questions_trigger_%I
        BEFORE INSERT OR UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION validate_questions_%I();
    ', table_name, table_name, table_name);

    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

    -- Create policy for user access
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

    -- Create policy for admin access
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

    -- Create updated_at trigger
    EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    ', table_name, table_name);

    -- Add documentation
    EXECUTE format('
        COMMENT ON TABLE %I IS ''Form table for user %s
Example questions JSON:
[
  {
    "text": "Comment évaluez-vous votre expérience ?",
    "type": "note",
    "required": true
  },
  {
    "text": "Êtes-vous satisfait de nos services ?",
    "type": "smileys",
    "required": false
  },
  {
    "text": "Avez-vous des commentaires supplémentaires ?",
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

-- Trigger function to create form table for new users
CREATE OR REPLACE FUNCTION handle_new_user_form()
RETURNS TRIGGER AS $$
BEGIN
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