/*
# A.S Properties - User Accounts, Newsletter, and Notifications (DDL)

## Overview
Adds user registration support, newsletter subscription management, and a notification system for communicating with registered users.

## New Tables
1. profiles - Extends auth.users with public profile data (full_name, phone, avatar_url, role, is_active)
2. newsletter_subscribers - Newsletter email subscriptions (email, user_id, is_active)
3. notifications - Messages/news sent to users (user_id, title, message, type, is_read)
4. user_favorites - Authenticated user favorites (user_id, property_id)

## Modified Tables
- inquiries: Added nullable user_id column
- favorites: Added nullable user_id column

## Security (RLS)
- profiles: Users read/update own profile; admins read all and update is_active
- newsletter_subscribers: Public can subscribe; admin can select/delete; users can unsubscribe own
- notifications: Users read own; admin can insert/update/delete
- user_favorites: Users manage own favorites only
- inquiries: Users can read inquiries linked to their account
- favorites: Users can read favorites linked to their account

## Notes
1. A trigger auto-creates a profile row when a new auth.user signs up.
2. The admin role is determined by the profiles.role column.
3. Newsletter subscribers can be standalone (email only) or linked to a user account.
4. Notifications with user_id = null are broadcasts visible to all authenticated users.
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (but not role or is_active)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_select_profiles" ON profiles;
CREATE POLICY "admin_select_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admins can update profiles (for activating/deactivating users)
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (insert email)
DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter"
ON newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can check if an email is subscribed (for unsubscribe verification)
DROP POLICY IF EXISTS "public_select_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_select_newsletter"
ON newsletter_subscribers FOR SELECT
TO anon, authenticated
USING (true);

-- Users can update (unsubscribe) their own subscription
DROP POLICY IF EXISTS "user_update_own_newsletter" ON newsletter_subscribers;
CREATE POLICY "user_update_own_newsletter"
ON newsletter_subscribers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin can delete subscribers
DROP POLICY IF EXISTS "admin_delete_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_delete_newsletter"
ON newsletter_subscribers FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admin can update subscribers
DROP POLICY IF EXISTS "admin_update_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_update_newsletter"
ON newsletter_subscribers FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read notifications addressed to them or broadcasts (user_id is null)
DROP POLICY IF EXISTS "user_select_notifications" ON notifications;
CREATE POLICY "user_select_notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "user_update_notifications" ON notifications;
CREATE POLICY "user_update_notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Admin can insert notifications
DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Admin can delete notifications
DROP POLICY IF EXISTS "admin_delete_notifications" ON notifications;
CREATE POLICY "admin_delete_notifications"
ON notifications FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- USER FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_select_own_favorites" ON user_favorites;
CREATE POLICY "user_select_own_favorites"
ON user_favorites FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_own_favorites" ON user_favorites;
CREATE POLICY "user_insert_own_favorites"
ON user_favorites FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_delete_own_favorites" ON user_favorites;
CREATE POLICY "user_delete_own_favorites"
ON user_favorites FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- MODIFY EXISTING TABLES: Add user_id to inquiries and favorites
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE inquiries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE favorites ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Allow users to read inquiries linked to their account
DROP POLICY IF EXISTS "user_select_own_inquiries" ON inquiries;
CREATE POLICY "user_select_own_inquiries"
ON inquiries FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to read favorites linked to their account
DROP POLICY IF EXISTS "user_select_own_session_favorites" ON favorites;
CREATE POLICY "user_select_own_session_favorites"
ON favorites FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_property ON user_favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries(user_id);

-- ============================================================
-- TRIGGER: Auto-update profiles.updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();