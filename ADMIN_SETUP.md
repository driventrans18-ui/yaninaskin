# Admin Panel Setup Guide

The admin panel allows you to manage reviews, services, and bio content directly from the dashboard.

## Access URLs

- **Reviews**: `/admin/reviews`
- **Services**: `/admin/services`
- **Bio/About**: `/admin/about`

All require password authentication (default: `skinbeauty`)

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

## Password Change

To change the admin password from the default "skinbeauty":
1. Search for `"skinbeauty"` in the codebase
2. Update in:
   - `app/admin/reviews/page.tsx`
   - `app/admin/services/page.tsx`
   - `app/admin/about/page.tsx`

## Security Notes

- ⚠️ Never commit `.env.local` or expose your service role key
- The service role key is for server-side use only
- Always use HTTPS in production
- Consider changing the default password for your deployment
