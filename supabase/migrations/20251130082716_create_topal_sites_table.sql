/*
  # Create Topal Sites Table

  1. New Tables
    - `topal_sites`
      - `id` (uuid, primary key) - Unique identifier for each site
      - `domain` (text, unique) - The domain name (e.g., 'mysite.topal')
      - `title` (text) - Human-readable site title
      - `html_content` (text) - The full HTML/CSS/JS content of the site
      - `created_at` (timestamptz) - When the site was deployed
      - `updated_at` (timestamptz) - Last time the site was updated
      - `owner_id` (text) - Browser fingerprint/session ID of who deployed it
  
  2. Security
    - Enable RLS on `topal_sites` table
    - Add policy for anyone to read all sites (public browser)
    - Add policy for owners to insert their own sites
    - Add policy for owners to update their own sites
    - Add policy for owners to delete their own sites
  
  3. Indexes
    - Index on `domain` for fast lookups
    - Index on `owner_id` for filtering user's sites
*/

CREATE TABLE IF NOT EXISTS topal_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  title text NOT NULL,
  html_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id text NOT NULL
);

ALTER TABLE topal_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view all sites"
  ON topal_sites FOR SELECT
  USING (true);

CREATE POLICY "Users can deploy their own sites"
  ON topal_sites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own sites"
  ON topal_sites FOR UPDATE
  USING (owner_id = current_setting('request.headers')::json->>'x-owner-id')
  WITH CHECK (owner_id = current_setting('request.headers')::json->>'x-owner-id');

CREATE POLICY "Users can delete their own sites"
  ON topal_sites FOR DELETE
  USING (owner_id = current_setting('request.headers')::json->>'x-owner-id');

CREATE INDEX IF NOT EXISTS idx_topal_sites_domain ON topal_sites(domain);
CREATE INDEX IF NOT EXISTS idx_topal_sites_owner ON topal_sites(owner_id);