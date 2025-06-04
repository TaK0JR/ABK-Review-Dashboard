/*
  # Create admin user account
  
  Creates an admin user with the following credentials:
  - Email: abkdigitalagency@gmail.com
  - Password: Abk35$
*/

-- First, create the user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'abkdigitalagency@gmail.com',
  crypt('Abk35$', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin ABK"}',
  false,
  'authenticated'
);

-- Then, create the user profile
INSERT INTO public.users (
  id,
  email,
  full_name,
  company_name,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Admin ABK',
  'ABK Digital Agency',
  created_at,
  updated_at
FROM auth.users
WHERE email = 'abkdigitalagency@gmail.com';