/*
# Fix Signup Trigger and Enable First Admin Access

## Overview
Fixes the `handle_new_user` trigger function that was failing during user registration
due to a mutable search_path. Also makes the first registered user an admin automatically
so the admin panel is accessible.

## Changes
1. Recreate `handle_new_user()` with explicit `set search_path = public` to fix the security warning
2. Modify the function to check if any admin exists — if not, the new user becomes admin
3. Revoke EXECUTE on `handle_new_user()` from anon and authenticated (it's a trigger, not an RPC)

## Security
- The trigger function is SECURITY DEFINER (runs as owner) — EXECUTE is revoked from anon/authenticated
- The search_path is now fixed to `public`, preventing search_path injection
*/

-- Recreate the trigger function with fixed search_path and first-admin logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  -- If no admin exists yet, make this user the first admin
  SELECT count(*) INTO admin_count FROM profiles WHERE role = 'admin';
  IF admin_count = 0 THEN
    UPDATE profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Revoke direct execution from anon and authenticated (this is a trigger, not an RPC)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Also fix the other function with mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
