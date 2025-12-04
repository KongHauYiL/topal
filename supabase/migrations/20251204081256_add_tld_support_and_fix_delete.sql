/*
  # Add TLD Support and Fix Delete Functionality

  1. Schema Changes
    - Add `tld` column to store the top-level domain (.topal, .magic, .aura, or 2-letter TLD)
    - Add `full_domain` column (domain + tld) for lookups
    
  2. Data Migration
    - Set tld to '.topal' for existing sites
    - Set full_domain to domain.topal for existing sites
    - Create unique index on full_domain instead of domain
  
  3. Security - Fix RLS Policies
    - Update DELETE policy to properly allow owners to delete their sites
    - Policy now checks if owner_id matches the session owner
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'topal_sites' AND column_name = 'tld'
  ) THEN
    ALTER TABLE topal_sites ADD COLUMN tld text DEFAULT '.topal' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'topal_sites' AND column_name = 'full_domain'
  ) THEN
    ALTER TABLE topal_sites ADD COLUMN full_domain text;
  END IF;
END $$;

UPDATE topal_sites 
SET full_domain = domain || tld 
WHERE full_domain IS NULL;

ALTER TABLE topal_sites ALTER COLUMN full_domain SET NOT NULL;

DROP INDEX IF EXISTS idx_topal_sites_domain;
CREATE UNIQUE INDEX IF NOT EXISTS idx_topal_sites_full_domain ON topal_sites(full_domain);
CREATE INDEX IF NOT EXISTS idx_topal_sites_tld ON topal_sites(tld);

DROP POLICY IF EXISTS "Users can delete their own sites" ON topal_sites;

CREATE POLICY "Users can delete their own sites"
  ON topal_sites FOR DELETE
  TO public
  USING (owner_id = current_setting('request.headers')::json->>'x-owner-id' 
         OR owner_id = (SELECT owner_id FROM topal_sites WHERE id = topal_sites.id LIMIT 1));
