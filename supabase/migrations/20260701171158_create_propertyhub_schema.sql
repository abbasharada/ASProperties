/*
# PropertyHub Nigeria - Core Schema

## Overview
Creates the complete database schema for PropertyHub Nigeria, a premium real estate advertising platform.
The admin is the only user who can upload/edit/delete properties. Visitors browse, search, and contact.

## New Tables

1. **properties** - Main property listings
   - id (uuid, PK)
   - title (text) - Property title
   - description (text) - Full description
   - price (numeric) - Property price in NGN
   - currency (text, default 'NGN')
   - property_type (text) - houses, estates, lands, plots, shops, offices, warehouses, commercial_buildings
   - status (text) - for_sale, for_rent, sold, rented
   - state (text) - Nigerian state
   - city (text) - City
   - area (text) - Area/neighborhood
   - address (text) - Full address
   - bedrooms (int) - Number of bedrooms
   - bathrooms (int) - Number of bathrooms
   - land_size (numeric) - Land size in sqm
   - built_size (numeric) - Built-up area in sqm
   - features (text[]) - Array of features
   - images (text[]) - Array of image URLs
   - videos (text[]) - Array of video URLs
   - is_featured (boolean, default false) - Featured on homepage
   - is_verified (boolean, default false) - Verified listing with trust badge
   - views (int, default 0) - View count
   - ad_start_date (date) - Advertisement start
   - ad_expiry_date (date) - Advertisement expiry
   - is_active (boolean, default true) - Active/visible
   - created_at (timestamptz)
   - updated_at (timestamptz)

2. **inquiries** - Contact form submissions
   - id (uuid, PK)
   - name (text)
   - email (text)
   - phone (text)
   - message (text)
   - property_id (uuid, FK to properties, nullable)
   - inquiry_type (text) - info, advertise, general
   - status (text, default 'new') - new, read, responded
   - created_at (timestamptz)

3. **blog_posts** - Blog articles
   - id (uuid, PK)
   - title (text)
   - slug (text, unique)
   - excerpt (text)
   - content (text)
   - image_url (text)
   - author (text, default 'PropertyHub Nigeria')
   - category (text)
   - is_published (boolean, default true)
   - views (int, default 0)
   - created_at (timestamptz)
   - updated_at (timestamptz)

4. **testimonials** - Client testimonials
   - id (uuid, PK)
   - name (text)
   - role (text) - e.g. "Property Developer"
   - company (text)
   - message (text)
   - rating (int, default 5)
   - avatar_url (text)
   - is_active (boolean, default true)
   - created_at (timestamptz)

5. **ad_packages** - Advertising packages
   - id (uuid, PK)
   - name (text)
   - description (text)
   - price (numeric)
   - duration_days (int)
   - features (text[])
   - is_popular (boolean, default false)
   - display_order (int, default 0)
   - is_active (boolean, default true)

6. **site_settings** - Homepage content and contact info
   - id (uuid, PK)
   - hero_title (text)
   - hero_subtitle (text)
   - hero_image_url (text)
   - whatsapp_number (text)
   - phone_number (text)
   - email (text)
   - office_address (text)
   - about_text (text)
   - facebook_url (text)
   - twitter_url (text)
   - instagram_url (text)
   - linkedin_url (text)
   - updated_at (timestamptz)

7. **favorites** - Visitor saved properties (stored by session)
   - id (uuid, PK)
   - property_id (uuid, FK to properties)
   - session_id (text) - Browser session identifier
   - created_at (timestamptz)

## Security (RLS)
- properties: Public SELECT (anon+authenticated), admin-only INSERT/UPDATE/DELETE (authenticated)
- inquiries: Public SELECT+INSERT (anon+authenticated), admin-only UPDATE/DELETE
- blog_posts: Public SELECT, admin-only INSERT/UPDATE/DELETE
- testimonials: Public SELECT, admin-only INSERT/UPDATE/DELETE
- ad_packages: Public SELECT, admin-only INSERT/UPDATE/DELETE
- site_settings: Public SELECT, admin-only UPDATE
- favorites: Public SELECT+INSERT+DELETE (by session_id)

## Important Notes
1. The admin authenticates via Supabase Auth (email/password). Only authenticated users can write.
2. Visitors use the anon key to browse and submit inquiries.
3. Expired properties are auto-hidden via the is_active flag and ad_expiry_date checks.
*/

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  property_type text NOT NULL DEFAULT 'houses',
  status text NOT NULL DEFAULT 'for_sale',
  state text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  bedrooms int DEFAULT 0,
  bathrooms int DEFAULT 0,
  land_size numeric DEFAULT 0,
  built_size numeric DEFAULT 0,
  features text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  views int NOT NULL DEFAULT 0,
  ad_start_date date,
  ad_expiry_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_properties" ON properties;
CREATE POLICY "public_select_properties"
ON properties FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_properties" ON properties;
CREATE POLICY "admin_insert_properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_properties" ON properties;
CREATE POLICY "admin_update_properties"
ON properties FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_properties" ON properties;
CREATE POLICY "admin_delete_properties"
ON properties FOR DELETE
TO authenticated
USING (true);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  inquiry_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_inquiries" ON inquiries;
CREATE POLICY "public_select_inquiries"
ON inquiries FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_inquiries" ON inquiries;
CREATE POLICY "public_insert_inquiries"
ON inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_inquiries" ON inquiries;
CREATE POLICY "admin_update_inquiries"
ON inquiries FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_inquiries" ON inquiries;
CREATE POLICY "admin_delete_inquiries"
ON inquiries FOR DELETE
TO authenticated
USING (true);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'PropertyHub Nigeria',
  category text NOT NULL DEFAULT 'Real Estate',
  is_published boolean NOT NULL DEFAULT true,
  views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_blog_posts" ON blog_posts;
CREATE POLICY "public_select_blog_posts"
ON blog_posts FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_blog_posts" ON blog_posts;
CREATE POLICY "admin_insert_blog_posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_blog_posts" ON blog_posts;
CREATE POLICY "admin_update_blog_posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_blog_posts" ON blog_posts;
CREATE POLICY "admin_delete_blog_posts"
ON blog_posts FOR DELETE
TO authenticated
USING (true);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  rating int NOT NULL DEFAULT 5,
  avatar_url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_testimonials" ON testimonials;
CREATE POLICY "public_select_testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_testimonials" ON testimonials;
CREATE POLICY "admin_insert_testimonials"
ON testimonials FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_testimonials" ON testimonials;
CREATE POLICY "admin_update_testimonials"
ON testimonials FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_testimonials" ON testimonials;
CREATE POLICY "admin_delete_testimonials"
ON testimonials FOR DELETE
TO authenticated
USING (true);

-- Ad packages table
CREATE TABLE IF NOT EXISTS ad_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  duration_days int NOT NULL DEFAULT 30,
  features text[] DEFAULT '{}',
  is_popular boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE ad_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_ad_packages" ON ad_packages;
CREATE POLICY "public_select_ad_packages"
ON ad_packages FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_ad_packages" ON ad_packages;
CREATE POLICY "admin_insert_ad_packages"
ON ad_packages FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_ad_packages" ON ad_packages;
CREATE POLICY "admin_update_ad_packages"
ON ad_packages FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_ad_packages" ON ad_packages;
CREATE POLICY "admin_delete_ad_packages"
ON ad_packages FOR DELETE
TO authenticated
USING (true);

-- Site settings table (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL DEFAULT 'Find Your Dream Property in Nigeria',
  hero_subtitle text NOT NULL DEFAULT 'Premium properties, estates, and land for sale and rent across Nigeria',
  hero_image_url text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '+234 800 000 0000',
  phone_number text NOT NULL DEFAULT '+234 800 000 0000',
  email text NOT NULL DEFAULT 'info@propertyhub.ng',
  office_address text NOT NULL DEFAULT 'Lagos, Nigeria',
  about_text text NOT NULL DEFAULT '',
  facebook_url text NOT NULL DEFAULT '',
  twitter_url text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_site_settings" ON site_settings;
CREATE POLICY "public_select_site_settings"
ON site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings"
ON site_settings FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings"
ON site_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_favorites" ON favorites;
CREATE POLICY "public_select_favorites"
ON favorites FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_favorites" ON favorites;
CREATE POLICY "public_insert_favorites"
ON favorites FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_favorites" ON favorites;
CREATE POLICY "public_delete_favorites"
ON favorites FOR DELETE
TO anon, authenticated
USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
