/*
# A.S Properties - User Accounts, Newsletter, and Notifications

## Overview
Adds user registration support, newsletter subscription management, and a notification system for communicating with registered users.

## New Tables

1. **profiles** - Extends auth.users with public profile data
   - id (uuid, PK, references auth.users)
   - full_name (text)
   - phone (text)
   - avatar_url (text)
   - role (text, default 'user') - 'user' or 'admin'
   - is_active (boolean, default true) - admin can disable accounts
   - created_at (timestamptz)
   - updated_at (timestamptz)

2. **newsletter_subscribers** - Newsletter email subscriptions
   - id (uuid, PK)
   - email (text, unique)
   - user_id (uuid, nullable, references auth.users)
   - is_active (boolean, default true)
   - subscribed_at (timestamptz)

3. **notifications** - Messages/news sent to users
   - id (uuid, PK)
   - user_id (uuid, references auth.users) - null = broadcast to all
   - title (text)
   - message (text)
   - type (text, default 'info') - info, news, alert
   - is_read (boolean, default false)
   - created_at (timestamptz)

4. **user_favorites** - Authenticated user favorites (separate from session-based favorites)
   - id (uuid, PK)
   - user_id (uuid, references auth.users)
   - property_id (uuid, references properties)
   - created_at (timestamptz)

## Modified Tables
- **inquiries** - Added nullable user_id column for linking inquiries to registered users
- **favorites** - Added nullable user_id column for linking favorites to registered users

## Security (RLS)
- profiles: Users read/update own profile; admins read all and update is_active
- newsletter_subscribers: Public can subscribe (insert); admin can select/delete; users can unsubscribe own
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