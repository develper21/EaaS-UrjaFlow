# Supabase Setup Guide for UrjaFlow

This guide will help you set up Supabase for the UrjaFlow application.

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: UrjaFlow
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free (for development)
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Go to "API" section
3. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

## Step 4: Database Setup Options

### Option A: Use Prisma with Supabase PostgreSQL (Recommended)

1. Get your database connection string:
   - Go to "Settings" → "Database"
   - Copy the "Connection string" under "Connection pooling"
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

2. Update your `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true"
```

3. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### Option B: Use SQLite for Quick Start (Development Only)

Keep the default in `.env`:
```env
DATABASE_URL="file:./dev.db"
```

Then run:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

## Step 5: Enable Row Level Security (Optional but Recommended)

1. Go to "Authentication" → "Policies"
2. Enable RLS for tables
3. Add policies for user data isolation

Example policy for `devices` table:
```sql
CREATE POLICY "Users can view own devices"
ON devices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
ON devices FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Step 6: Setup Supabase Edge Functions (Optional)

If you want to use Supabase Edge Functions instead of Next.js API routes:

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy functions:
```bash
supabase functions deploy
```

## Step 7: Configure Authentication

1. Go to "Authentication" → "Providers"
2. Enable providers you want:
   - **Email**: Already enabled
   - **Google**: Add OAuth credentials
   - **GitHub**: Add OAuth credentials

3. Configure email templates:
   - Go to "Authentication" → "Email Templates"
   - Customize signup, password reset emails

## Step 8: Setup Storage (Optional)

For file uploads (future feature):

1. Go to "Storage"
2. Create a new bucket: `avatars`
3. Set bucket to public or private
4. Add storage policies

## Step 9: Test Connection

Create a test file `test-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count');
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Connected to Supabase!', data);
  }
}

testConnection();
```

Run it:
```bash
npx tsx test-supabase.ts
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to database
**Solution**: 
- Check if your IP is whitelisted in Supabase dashboard
- Verify DATABASE_URL is correct
- Ensure project is not paused (free tier pauses after inactivity)

### Migration Errors

**Problem**: Prisma migrations fail
**Solution**:
- Make sure you're using the connection pooling URL
- Add `?pgbouncer=true` to your DATABASE_URL
- Try direct connection URL for migrations

### Authentication Not Working

**Problem**: Users can't sign in
**Solution**:
- Check if email confirmation is required
- Verify NEXTAUTH_URL matches your app URL
- Check Supabase Auth logs in dashboard

## Production Checklist

Before deploying to production:

- [ ] Enable Row Level Security on all tables
- [ ] Set up proper authentication policies
- [ ] Configure custom SMTP for emails
- [ ] Set up database backups
- [ ] Enable SSL for database connections
- [ ] Review and limit API rate limits
- [ ] Set up monitoring and alerts
- [ ] Configure proper CORS settings
- [ ] Use environment-specific API keys
- [ ] Enable 2FA for Supabase account

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Support

If you encounter issues:
1. Check Supabase status: https://status.supabase.com
2. Visit Supabase Discord: https://discord.supabase.com
3. Check GitHub issues: https://github.com/supabase/supabase/issues
