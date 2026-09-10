/*
# Fix profile policy recursion and restore secure admin access

## Overview
The existing admin policies on `profiles` queried `profiles` again to determine whether the caller was an administrator. PostgreSQL evaluates that as the same policy again, causing the error `infinite recursion detected in policy for relation "profiles"`. This prevented profile loading, so the application could not recognize an administrator.

## Database changes
1. Add `public.is_admin()` as a protected helper that checks the signed-in user's role without re-entering the `profiles` row policies.
2. Replace recursive profile SELECT and UPDATE policies with policies that use the helper.
3. Keep users limited to their own profile rows for ordinary profile reads and edits.
4. Restrict direct profile updates to user-editable columns: `full_name`, `phone`, and `avatar_url`.
5. Add `public.set_user_active(uuid, boolean)` for administrators to activate or disable accounts without allowing browser clients to change roles or other protected fields.

## Security
- The helper and admin mutation function use `SECURITY DEFINER` with a fixed `search_path`.
- Direct execution is revoked from the public and anonymous roles.
- Only authenticated users can call the helper, and only authenticated users can call the admin mutation function; the function itself verifies administrator status.
- Users cannot promote themselves by editing `profiles.role` or bypass account status controls.

## Important notes
1. Existing profile rows and roles are preserved.
2. Existing profile editing remains available for name, phone number, and avatar URL.
3. The admin users screen must use `set_user_active` for account status changes.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "admin_select_profiles" ON public.profiles;
CREATE POLICY "admin_select_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.set_user_active(p_user_id uuid, p_is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
  SET is_active = p_is_active,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_user_active(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_active(uuid, boolean) TO authenticated;
