# Huoma Akwetelier waitlist (Vite + React + Supabase)
1. `npm install` (this already installs `@supabase/supabase-js`; you do NOT need `@supabase/ssr`, that is only for Next.js).
2. Copy `.env.example` to `.env` and paste your values. The names Supabase gives you work as they are:
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_BRAND_WHATSAPP (digits only, e.g. 2348012345678).
   Restart `npm run dev` whenever you change `.env`.
3. Run `supabase.sql` in the Supabase SQL Editor.
4. Authentication > Users: create your admin user, then run: `insert into public.admins values ('huomaakwete@gmail.com');`
5. `npm run dev`. Admin is at `/admin`. Without a `.env` the form runs in preview mode (nothing is saved).
6. `npm run build`, then deploy the `dist` folder. Add the same variables on the host, and a rewrite of all paths to `/index.html`
   (Netlify: `public/_redirects` is included. Vercel: `vercel.json` is included.)

## Opening the admin dashboard
- Go to `/admin` on your site: `http://localhost:5173/admin` while testing, `https://YOUR-DOMAIN/admin` once live.
- Sign in with the admin email and password you created in Supabase (Authentication > Users).
- That email must also be in the `admins` table (see step 4), otherwise the list will not load.
