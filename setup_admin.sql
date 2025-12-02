-- ============================================================
-- Setup Admin Account for Localhost Platform
-- ============================================================
-- This script helps you set up the initial admin account.
--
-- OPTION 1: Promote existing team to admin
-- ============================================================
-- If you already created a team through the admin panel or have
-- an existing team, you can promote them to admin:

-- Replace 'TEAM_UUID' with the actual UUID from teams table
UPDATE public.teams
SET role = 'admin'
WHERE id = 'TEAM_UUID';

-- Example: Find team by team_id and promote to admin
UPDATE public.teams
SET role = 'admin'
WHERE team_id = 'admin001';


-- ============================================================
-- OPTION 2: Create admin via Supabase Dashboard
-- ============================================================
-- Since Supabase Auth requires special handling, the recommended
-- approach is to:
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" (or "Invite User")
-- 3. Create user with:
--    - Email: admin@localhost.com (or your choice)
--    - Password: (set a strong password)
--    - Auto Confirm User: YES
--
-- 4. Copy the UUID of the created user
--
-- 5. Run this SQL in SQL Editor:

INSERT INTO public.teams (id, team_id, name, coins, role)
VALUES (
  'USER_UUID_FROM_STEP_4',  -- Replace with actual UUID
  'admin001',                 -- Admin team ID for login
  'Administrator',            -- Display name
  10000,                      -- Initial coins
  'admin'                     -- Admin role
);

-- ============================================================
-- OPTION 3: Using Auth Admin API (Recommended for automation)
-- ============================================================
-- You can also use the Supabase Admin API from your local environment.
-- See: setup_admin.md for a Node.js script example


-- ============================================================
-- Verify Admin Account
-- ============================================================
-- Check if admin account exists and has correct role:

SELECT
  t.id,
  t.team_id,
  t.name,
  t.role,
  t.coins,
  t.created_at
FROM public.teams t
WHERE t.role = 'admin';


-- ============================================================
-- Reset Admin Password (if needed)
-- ============================================================
-- If you need to reset an admin's password, use Supabase Dashboard:
-- Authentication → Users → Select user → Reset Password
-- Or use the Auth Admin API


-- ============================================================
-- Remove Admin Privileges (demote to user)
-- ============================================================
-- To demote an admin back to regular user:

UPDATE public.teams
SET role = 'user'
WHERE id = 'TEAM_UUID';
