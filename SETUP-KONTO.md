# Google Login and cloud favorites — setup

The account page and cloud favorites are implemented, but cannot be activated until you configure a Supabase project and Google OAuth. Anonymous favorites work locally without credentials.

1. Create a Supabase project (free plan is enough for an MVP). In **SQL Editor**, run `supabase/schema.sql`. The `saved_jobs` table has RLS policies restricting every user to their own rows.
2. In **Authentication → Providers → Google**, enable Google. Create a Google Cloud OAuth web client and register the Supabase OAuth callback URL shown in Supabase as an authorized redirect URI. Copy Google's client ID and secret into Supabase. Never put the Google secret in `NEXT_PUBLIC_*` variables.
3. In **Authentication → URL Configuration**, set your site URL and allow `https://your-domain.example/konto` and `http://localhost:3000/konto` for local testing. With this browser-only configuration, Supabase handles the OAuth token response client-side.
4. Copy `.env.example` to `.env.local`, enter your project URL and its publishable/anon key from Supabase. Both are designed for browser use; do NOT use the service-role secret.
5. Run `npm install`, `npm run lint`, `npm run build`, then `npm run dev`.
6. Deploy the same public environment variables in Vercel. Google OAuth should be tested on the real domain as well as localhost.

Behavior: while signed out, favorites live in localStorage. On first sign-in, guest favorites are merged into the account (up to 200 items), after which all new changes go to Supabase. On logout, the local guest list is separate. Saved searches are still local-only for now.

Before public launch: review Datenschutzerklärung to disclose Supabase and Google sign-in and their data processing; arrange required legal agreements and retention/deletion policy. The site does not request or store Google credentials directly.

For additional listings, Arbeitnow offers a public German/European jobs feed without an API key: `https://www.arbeitnow.com/api/job-board-api`. Attribution and links back to Arbeitnow are required by its terms. Keep provider IDs namespaced (e.g. `arbeitnow:slug`) and avoid merging results until source-specific detail routing and deduplication are implemented.
