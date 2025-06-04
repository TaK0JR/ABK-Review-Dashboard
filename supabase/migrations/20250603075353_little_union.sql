/*
  # Create authentication table
  
  1. New Tables
    - `auth`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `full_name` (text)
      - `company_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
*/

CREATE TABLE IF NOT EXISTS auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text,
  company_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin user
INSERT INTO auth (
  email,
  password,
  full_name,
  company_name
) VALUES (
  'abkdigitalagency@gmail.com',
  crypt('Abk35$', gen_salt('bf')), -- Password is hashed using bcrypt
  'Admin ABK',
  'ABK Digital Agency'
);