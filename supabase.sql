-- Run once in Supabase > SQL Editor (fresh project, or drop the old waitlist table first)
create table public.waitlist (
  id bigint generated always as identity primary key,
  piece text not null,
  colour text not null,
  size text,
  measurements jsonb,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  created_at timestamptz not null default now()
);
create table public.admins (email text primary key);
alter table public.waitlist enable row level security;
alter table public.admins enable row level security;

create function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'))
$$;

create policy "admins read waitlist" on public.waitlist
  for select to authenticated using (public.is_admin());

create function public.reserve_place(
  p_piece text, p_colour text, p_size text, p_measurements jsonb,
  p_name text, p_email text, p_whatsapp text)
returns text language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  if length(trim(p_name)) < 2
     or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or p_whatsapp !~ '^\+[0-9]{7,15}$' then
    raise exception 'invalid details';
  end if;
  insert into waitlist (piece, colour, size, measurements, full_name, email, whatsapp)
  values (p_piece, p_colour, p_size, p_measurements, trim(p_name), lower(trim(p_email)), p_whatsapp)
  returning id into v_id;
  return 'HA-R' || lpad(v_id::text, 3, '0');
end $$;
grant execute on function public.reserve_place to anon, authenticated;

-- After creating your admin user in Authentication > Users:
-- insert into public.admins values ('you@example.com');
