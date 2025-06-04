/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to auth.users.id
      - `email` (text, unique) - User's email address
      - `full_name` (text) - User's full name
      - `company_name` (text) - User's company name
      - `avatar_url` (text) - URL to user's avatar image
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Users can read their own data
      - Users can update their own data
      - New users are automatically inserted on signup

  3. Triggers
    - Update updated_at timestamp automatically
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Handle new user signups
CREATE POLICY "New users can insert their profile once" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);