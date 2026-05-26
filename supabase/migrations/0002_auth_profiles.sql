-- Link profiles to Supabase Auth and auto-create profile on sign-up

alter table public.profiles
  alter column id drop default;

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- Auto-create profile row when a new auth user registers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  avatar_colors text[] := array[
    '#BEFF00', '#FF6701', '#00FFFF', '#F3EEE4',
    '#9B5DE5', '#FF477E', '#06D6A0', '#FFD60A'
  ];
  picked_color text;
  display text;
begin
  display := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1)
  );
  picked_color := avatar_colors[1 + (abs(hashtext(new.id::text)) % array_length(avatar_colors, 1))];

  insert into public.profiles (id, email, display_name, avatar_color, cm_ticket_id, role)
  values (
    new.id,
    new.email,
    display,
    picked_color,
    null,
    'participant'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(nullif(excluded.display_name, ''), profiles.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill-safe: logged-in user without a profile row (e.g. signed up before trigger existed)
create or replace function public.ensure_user_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u record;
  avatar_colors text[] := array[
    '#BEFF00', '#FF6701', '#00FFFF', '#F3EEE4',
    '#9B5DE5', '#FF477E', '#06D6A0', '#FFD60A'
  ];
  picked_color text;
  display text;
begin
  select id, email, raw_user_meta_data into u from auth.users where id = auth.uid();
  if not found then return; end if;
  if exists (select 1 from public.profiles where id = u.id) then return; end if;

  display := coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    split_part(u.email, '@', 1)
  );
  picked_color := avatar_colors[1 + (abs(hashtext(u.id::text)) % array_length(avatar_colors, 1))];

  insert into public.profiles (id, email, display_name, avatar_color, cm_ticket_id, role)
  values (u.id, u.email, display, picked_color, null, 'participant');
end;
$$;

grant execute on function public.ensure_user_profile() to authenticated;
