/*
  # Fix RLS policies for forms tables

  1. Changes
    - Add INSERT policy for forms_demo table to allow authenticated users to create forms
    - Add INSERT policy for forms_abkdigitalagency table to allow authenticated users to create forms
    - Ensure policies check user email matches the table suffix

  2. Security
    - Maintains existing RLS policies
    - Adds specific INSERT policies with proper email validation
    - Keeps table-specific access control
*/

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