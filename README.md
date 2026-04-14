# Story

Story is a Next.js 16 app deployed with Vercel and backed by Supabase for auth, realtime profile updates, content storage metadata, and admin lock/unlock controls with 30-day unlock windows.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Vercel Deployment

This repo is ready for Vercel's default Next.js deployment flow.

### Before deploying

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.
3. In Supabase, enable realtime/replication for:
   - `public.profiles`
   - `public.content`
   - `public.settings`
4. Make sure your PayPal plan IDs and client ID are available.

### Environment variables to add in Vercel

Add these in `Project Settings -> Environment Variables`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_PAYPAL_PLAN_BASIC=
NEXT_PUBLIC_PAYPAL_PLAN_PREMIUM=
NEXT_PUBLIC_PAYPAL_PLAN_ULTIMATE=
```

You can use `.env.example` as the source of truth for required keys.

### Deploy steps

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. Import the repo into Vercel.
3. Keep the default framework preset as `Next.js`.
4. Add the environment variables listed above for Production, Preview, and Development as needed.
5. Trigger the first deployment.

### Health check

After deployment, you can verify the app is alive at:

```text
/api/health
```

Example:

```text
https://your-project.vercel.app/api/health
```

## Build Commands

```bash
npm run lint
npm run build
npm run start
```

## Notes

- The app uses `proxy.ts` for Supabase session refresh in Next.js 16.
- Email and password authentication is handled by Supabase Auth (`auth.users`). Passwords are stored as hashes by Supabase, not in `public` tables.
- Admin access uses a server-validated password (`/api/admin/session`) and httpOnly session cookie.
- Audio playback for users is enforced from the Settings dashboard plan/lock state.
- If you change environment variables in Vercel, redeploy the project so the new values apply.
