# Admin Account Setup Guide

This guide explains how to create administrator accounts for the Localhost platform.

## Prerequisites

- Supabase project is set up
- Database migrations have been run (`schema.sql` and `add_role_to_teams` migration)
- Service Role Key is configured in `.env.local`

---

## ⭐ Method 1: Self Sign-Up (Recommended)

**Admin accounts can now sign up directly** using the web interface with a special email pattern.

### Requirements
- Email must match pattern: `teacher000@bssm.hs.kr` (where 000 is any 3-digit number)
- Examples: `teacher001@bssm.hs.kr`, `teacher123@bssm.hs.kr`, `teacher999@bssm.hs.kr`

### Steps
1. Go to `/auth/sign-up` in your browser
2. Enter email in the format `teacherXXX@bssm.hs.kr` (replace XXX with your number)
3. Enter password (minimum 6 characters)
4. Confirm password
5. Click "관리자 계정 만들기" (Create Admin Account)
6. You will be redirected to login page
7. Login with the email and password you just created

**Note:** Only emails matching `teacher\d{3}@bssm\.hs\.kr` pattern can sign up. All other email formats will be rejected. Accounts created this way are automatically assigned the `admin` role.

---

## Method 2: Using Supabase Dashboard

### Step 1: Create Auth User

1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Users**
3. Click **"Add User"**
4. Fill in:
   - **Email**: `admin@localhost.com` (or your preferred email)
   - **Password**: Set a strong password (save this!)
   - **Auto Confirm User**: ✅ **YES** (important!)
5. Click **"Create User"**
6. **Copy the UUID** of the newly created user

### Step 2: Create Team Record

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace `USER_UUID` with the UUID from Step 1):

```sql
INSERT INTO public.teams (id, team_id, name, coins, role)
VALUES (
  'USER_UUID',      -- Paste UUID here
  'admin001',       -- This is the login ID
  'Administrator',  -- Display name
  10000,            -- Initial coins
  'admin'           -- Admin role
);
```

### Step 3: Login

1. Go to your app's login page
2. Login with:
   - **Email/Team ID**: `admin@localhost.com` (the email you set)
   - **Password**: The password you set
3. You should now have access to the `/admin` routes

---

## Method 3: Using Service Role Key (Programmatic)

### Setup

1. Get your Service Role Key from Supabase Dashboard:
   - **Settings → API → Project API keys → service_role**
   - ⚠️ **Keep this secret!** Never commit to git

2. Add to your `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Create Script

Create a file `scripts/create-admin.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const adminEmail = 'admin@localhost.com';
  const adminPassword = 'change-this-password'; // Change this!
  const teamId = 'admin001';
  const teamName = 'Administrator';

  try {
    // 1. Create Auth User
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { team_id: teamId, name: teamName }
    });

    if (authError) {
      throw authError;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create Team Record with Admin Role
    console.log('Creating team record...');
    const { error: dbError } = await supabase.from('teams').insert({
      id: authData.user.id,
      team_id: teamId,
      name: teamName,
      coins: 10000,
      role: 'admin' // Admin role!
    });

    if (dbError) {
      // Rollback: delete auth user if team creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    console.log('✅ Team record created with admin role');
    console.log('\n📧 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
```

### Run Script

```bash
node scripts/create-admin.mjs
```

---

## Method 4: Promote Existing Team to Admin

If you already created a team through the admin panel, you can promote them:

```sql
-- Find the team
SELECT id, team_id, name, role FROM public.teams;

-- Promote to admin
UPDATE public.teams
SET role = 'admin'
WHERE team_id = 'team001';  -- Replace with actual team_id

-- Verify
SELECT * FROM public.teams WHERE role = 'admin';
```

---

## Verify Admin Access

1. Login with admin credentials
2. Try accessing `/admin` route
3. Check that you can:
   - Create new teams
   - Manage products
   - Control auctions
   - View queue

---

## Security Best Practices

1. **Change default password immediately** after first login
2. **Never share Service Role Key** - it bypasses RLS
3. **Create only ONE admin account** initially
4. **Use strong passwords** for admin accounts
5. **Keep `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`** (not `.env`)

---

## Troubleshooting

### "Access Denied" when accessing /admin

**Solution**: Verify role in database:
```sql
SELECT id, team_id, role FROM public.teams WHERE team_id = 'admin001';
```
Role should be `'admin'`, not `'user'`.

### Cannot create teams through admin panel

**Solution**: Check that `SUPABASE_SERVICE_ROLE_KEY` is set in environment:
```bash
# In .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key-here
```

Restart dev server after adding.

### Email already exists error

**Solution**: The email is already registered. Either:
1. Use a different email
2. Delete the existing user from Supabase Dashboard → Authentication → Users
3. Promote the existing user to admin using Method 3

---

## Next Steps

After creating your admin account:

1. Login as admin
2. Go to `/admin/teams`
3. Create team accounts for participants
4. Distribute credentials to teams

Teams will login using the credentials you provide them.
