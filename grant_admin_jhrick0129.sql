-- ============================================================
-- Grant Admin Role to jhrick0129
-- ============================================================
-- This script grants admin privileges to the jhrick0129 account

-- OPTION 1: If the account already exists in teams table
-- ============================================================
-- Update existing team to admin role
UPDATE public.teams
SET role = 'admin'
WHERE team_id = 'jhrick0129';

-- Verify the update
SELECT id, team_id, name, role, coins
FROM public.teams
WHERE team_id = 'jhrick0129';


-- ============================================================
-- OPTION 2: If the account doesn't exist yet
-- ============================================================
-- First, create the Auth user via Supabase Dashboard:
-- 1. Go to Authentication → Users → Add User
-- 2. Email: jhrick0129@example.com (or any email)
-- 3. Password: [set a password]
-- 4. Auto Confirm User: YES
-- 5. Copy the UUID

-- Then run this SQL (replace USER_UUID with the actual UUID):
/*
INSERT INTO public.teams (id, team_id, name, coins, role)
VALUES (
  'USER_UUID',      -- Replace with UUID from Auth Users
  'jhrick0129',     -- Team ID for login
  'jhrick0129',     -- Display name
  10000,            -- Initial coins
  'admin'           -- Admin role
);
*/


-- ============================================================
-- Verify Admin Access
-- ============================================================
-- Check all admin accounts
SELECT
  t.id,
  t.team_id,
  t.name,
  t.role,
  t.coins,
  t.created_at
FROM public.teams t
WHERE t.role = 'admin'
ORDER BY t.created_at DESC;


-- ============================================================
-- Quick Check: Does jhrick0129 exist?
-- ============================================================
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM public.teams WHERE team_id = 'jhrick0129')
    THEN 'Account exists - use OPTION 1'
    ELSE 'Account does not exist - use OPTION 2'
  END as status;
