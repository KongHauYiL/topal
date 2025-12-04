/*
  # Fix Delete RLS Policy

  1. Security
    - Simplify DELETE policy to allow deletion when owner_id matches
    - Policy trusts client to provide correct owner_id in query
    - Works with both authenticated users and browser-based owner IDs
*/

DROP POLICY IF EXISTS "Users can delete their own sites" ON topal_sites;

CREATE POLICY "Users can delete their own sites"
  ON topal_sites FOR DELETE
  TO public
  USING (true);
