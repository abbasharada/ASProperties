/*
# Backfill Missing Profile and Set First Admin

## Overview
An existing auth user (musamkabir@gmail.com) has no profile row because they signed up
before the trigger was fixed. This migration creates their profile and sets them as admin.

## Changes
1. Insert a profile row for any auth.users that don't have one yet
2. Set the first user (musamkabir@gmail.com) as admin so the admin panel is accessible
*/

-- Backfill profiles for any auth.users missing one
INSERT INTO profiles (id, full_name, phone, role)
SELECT u.id, '', '', 'user'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);

-- Make the existing user an admin
UPDATE profiles SET role = 'admin' WHERE id = (
  SELECT id FROM auth.users WHERE email = 'musamkabir@gmail.com' LIMIT 1
);
