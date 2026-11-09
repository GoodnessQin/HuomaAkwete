-- Run ONCE in Supabase > SQL Editor, BEFORE deploying the new website.
-- Your existing reservations are kept. The old site keeps working until you deploy.
alter table public.waitlist add column if not exists lion_head_colour text;

drop function if exists public.reserve_place(text, text, text, jsonb, text, text, text);
create function public.reserve_place(
  p_piece text, p_colour text, p_size text, p_measurements jsonb,
  p_name text, p_email text, p_whatsapp text, p_lion_head_colour text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  if length(trim(p_name)) < 2
     or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or p_whatsapp !~ '^\+[0-9]{7,15}$' then
    raise exception 'invalid details';
  end if;
  insert into waitlist (piece, colour, lion_head_colour, size, measurements, full_name, email, whatsapp)
  values (p_piece, p_colour, p_lion_head_colour, p_size, p_measurements, trim(p_name), lower(trim(p_email)), p_whatsapp)
  returning id into v_id;
  return 'HA-R' || lpad(v_id::text, 3, '0');
end $$;
grant execute on function public.reserve_place to anon, authenticated;

-- Optional: rename the piece on reservations already saved
update public.waitlist set piece = 'Odogwu (ODG) aka Ísī Ọ́dụ̀m' where piece in ('Odogwu Edit', 'Odogwu ODG');
