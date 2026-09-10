/*
# Lock down handle_new_user trigger function

## Overview
The signup trigger function `handle_new_user()` was still executable via the REST API by anon and authenticated users. Although calling it directly only creates a profile row, it should not be callable as an RPC endpoint.

## Changes
1. Revoke EXECUTE from anon and authenticated on `handle_new_user()`.
2. The trigger still works because trigger invocation uses the function owner's privileges, not the caller's.

## Security
- The function is only invocable via the database trigger, not via the REST API.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
