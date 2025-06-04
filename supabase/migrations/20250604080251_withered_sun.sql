/*
  # Fix RLS policies for forms tables

  1. Changes
    - Add INSERT policies for forms tables to allow authenticated users to create forms
    - Ensure policies check user email matches table suffix
  
  2. Security
    - Maintain existing SELECT policies
    - Add new INSERT policies with proper user validation
    - Keep RLS enabled on all tables
*/

-- Fix RLS policies for forms_demo table
CREATE POLICY "Users can create their own forms in demo"
  ON forms_demo
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth
      WHERE auth.email = CURRENT_USER
      AND auth.email = 'demo@abk-review.com'
    )
  );

-- Fix RLS policies for forms_abkdigitalagency table
CREATE POLICY "Users can create their own forms in abkdigitalagency"
  ON forms_abkdigitalagency
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth
      WHERE auth.email = CURRENT_USER
      AND auth.email = 'abkdigitalagency@gmail.com'
    )
  );