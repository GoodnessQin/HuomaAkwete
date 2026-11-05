# Huoma Akwetelier waitlist (Vite + React + Supabase)
1. `npm install` (this already installs `@supabase/supabase-js`; ).
2. Copy `.env.example` to `.env` and paste your values. The names Supabase gives you work as they are:
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_BRAND_WHATSAPP (digits only, e.g. 2348012345678).
   Restart `npm run dev` whenever you change `.env`.
3. Run `supabase.sql` in the Supabase SQL Editor.
4. Authentication > Users: create your admin user, then run: `insert into public.admins values ('huomaakwete@gmail.com');`
5. `npm run dev`. Admin is at `/admin`. Without a `.env` the form runs in preview mode (nothing is saved).
6. `npm run build`, then deploy the `dist` folder. Add the same variables on the host, and a rewrite of all paths to `/index.html`
   
