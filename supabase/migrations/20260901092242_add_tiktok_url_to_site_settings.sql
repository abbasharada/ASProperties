/*
# Add TikTok URL to site settings

1. Modified Tables
- `site_settings`: Added `tiktok_url` (text, default '') for storing the TikTok profile/page URL.
2. Security
- No policy changes. Existing `admin_update_site_settings` UPDATE policy already covers the new column.
3. Notes
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ to avoid duplicate column errors on re-run.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'tiktok_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN tiktok_url text NOT NULL DEFAULT '';
  END IF;
END $$;
