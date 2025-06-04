/*
  # Fix form table policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate policies for forms_demo table
    - Recreate policies for forms_abkdigitalagency table
    
  2. Security
    - Ensure users can only create forms in their own tables
    - Maintain admin access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own forms in demo" ON forms_demo;
DROP POLICY IF EXISTS "Users can create their own forms in abkdigitalagency" ON forms_abkdigitalagency;

-- Fix forms_demo table policies
CREATE POLICY "Users can create their own forms in demo"
  ON forms_demo
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth
      WHERE auth.email = current_user
      AND auth.email = 'demo@abk-review.com'
    )
  );

-- Fix forms_abkdigitalagency table policies
CREATE POLICY "Users can create their own forms in abkdigitalagency"
  ON forms_abkdigitalagency
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth
      WHERE auth.email = current_user
      AND auth.email = 'abkdigitalagency@gmail.com'
    )
  );