/*
  # Add admin flag to auth table
  
  1. Changes
    - Add is_admin boolean column to auth table
    - Set ABK account as admin
*/

-- Add is_admin column
ALTER TABLE auth 
ADD COLUMN is_admin boolean DEFAULT false;

-- Set ABK account as admin
UPDATE auth
SET is_admin = true
WHERE email = 'abkdigitalagency@gmail.com';