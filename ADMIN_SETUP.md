# Admin Panel Setup Guide

The admin panel allows you to manage reviews, services, and bio content directly from the dashboard.

## Access URLs

- **Reviews**: `/admin/reviews`
- **Services**: `/admin/services`
- **Bio/About**: `/admin/about`

All admin pages require signing in with a real email + password
(Supabase Auth). Only accounts you explicitly create can sign in — see
"Admin Accounts (Sign-in)" below.

## Required Environment Variables

For the admin panel to work, you need to set the `SUPABASE_SERVICE_ROLE_KEY` environment variable. This is different from the public anon key and is required for admin operations.

### Step 1: Get Your Service Role Key

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to **Settings** > **API**
4. Find the **Service role (secret)** section
5. Copy the key (keep this secret! Never share or commit it)

### Step 2: Add to Local Development (.env.local)

Create or edit `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Step 3: Add to Vercel (Production)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [paste your service role key]
   - Environments: Select all (Development, Preview, Production)
4. Click **Add**
5. Redeploy your project for changes to take effect

## Troubleshooting

### "Service role key is not set" Error

The environment variable is missing. Follow Steps 1-3 above to configure it.

### Admin Operations Show "✗ Error"

Check the error message - if it mentions the service role key:
1. Verify the key is correctly set in your environment
2. Make sure there are no extra spaces or quotes around the key value
3. Redeploy after making changes

### Check Connectivity

Visit `/api/admin/diagnostic` to see the current configuration status:
- Shows which environment variables are set
- Tests connectivity to your Supabase tables
- Displays any errors

## Required migration for Gallery & before/after positioning

The Gallery tab and the per-image "drag to reposition" feature store data
in the database (so they do **not** depend on Supabase Storage listing,
which is what made gallery uploads appear to fail). Run this once in the
Supabase **SQL editor** for the project this site uses:

```sql
alter table public.about_content
  add column if not exists gallery jsonb default '[]'::jsonb;

alter table public.services
  add column if not exists treatment_before_position text,
  add column if not exists treatment_after_position  text;
```

Also confirm **`SUPABASE_SERVICE_ROLE_KEY` is set in Vercel** (and
`.env.local`). Image uploads (`/api/upload`) and all admin writes need it;
without it the code falls back to the anon key and uploads/saves fail with
a permission error. See "Required Environment Variables" above.

Until the migration is run: normal Bio/Services editing still works
(image-position values are only sent when set), but Gallery save and
before/after positioning will not persist.

## Database Schema

The admin panel manages these tables:

### about_content
- `id` (Primary Key)
- `eyebrow` (Text)
- `name` (Text)
- `bio1`, `bio2`, `bio3` (Text - three paragraphs)
- `badges` (Array of Text)
- `created_at`, `updated_at` (Timestamps)

### services
- `id` (Primary Key)
- `category_order`, `category_title`, `category_description`
- `treatment_order`, `treatment_title`, `treatment_price`, `treatment_duration`
- `treatment_description`, `treatment_note`
- `created_at`, `updated_at` (Timestamps)

### reviews
- `id` (Primary Key)
- `name`, `email` (nullable), `rating` (1-5), `comment`
- `approved` (Boolean - auto-posting enabled)
- `reply_text`, `reply_by` (nullable - for admin responses)
- `created_at` (Timestamp)

## Admin Accounts (Sign-in)

The admin is protected by **Supabase Auth** (real email + password). The
shared hardcoded password has been removed. Only the accounts you create
in Supabase can sign in.

### Step 1: Create the allowed accounts

1. Supabase dashboard → **Authentication → Users → Add user**
2. Create one user for the owner and one for the developer (email +
   a strong password each). "Auto Confirm User" should be ON so they can
   sign in immediately.

### Step 2: Disable public sign-ups (important)

So no random person can self-register an account:

1. Supabase dashboard → **Authentication → Providers → Email**
2. Turn **OFF** "Allow new users to sign up" (invite/admin-create only).

The sign-in screen has no "create account" option, but disabling
sign-ups closes it off at the API level too.

### Step 3 (optional, recommended): Email allowlist

As defense-in-depth you can restrict which Supabase accounts may enter
the admin even if more users ever exist. Set this environment variable
(local `.env.local` and Vercel):

```
NEXT_PUBLIC_ADMIN_EMAILS=owner@example.com,developer@example.com
```

Comma-separated, case-insensitive. If this variable is **unset**, any
authenticated Supabase user is allowed (so rely on Steps 1–2). If set,
only the listed emails can access the admin; others are signed out with
an "account not authorized" message. No emails or passwords are stored
in the codebase.

### Changing a password

Supabase dashboard → **Authentication → Users** → select the user →
**Reset password** / set a new password. No code change needed.

### Known follow-up (not yet done)

The admin **data-write** server actions (save/delete services, bio,
etc.) still run with the Supabase service-role key without verifying the
caller's session. The sign-in now stops unauthorized people from using
the UI, but a determined actor could still call those server actions
directly. Securing the server actions with a session check is a
recommended follow-up.

## Security Notes

- ⚠️ Never commit `.env.local` or expose your service role key
- The service role key is for server-side use only
- Always use HTTPS in production
- Consider changing the default password for your deployment
