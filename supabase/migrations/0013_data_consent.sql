-- Registration data consent (AVG/GDPR): store consent timestamp + 6-month retention window

alter table public.profiles
  add column if not exists data_consent_at timestamptz,
  add column if not exists data_retention_until timestamptz;

comment on column public.profiles.data_consent_at is
  'When the user consented to data processing at registration.';
comment on column public.profiles.data_retention_until is
  'Planned deletion/anonymisation horizon (typically consent + 6 months).';

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
  consent_at timestamptz;
begin
  display := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1)
  );
  picked_color := avatar_colors[1 + (abs(hashtext(new.id::text)) % array_length(avatar_colors, 1))];

  if (new.raw_user_meta_data ->> 'data_consent') = 'true' then
    consent_at := coalesce(
      nullif(new.raw_user_meta_data ->> 'data_consent_at', '')::timestamptz,
      now()
    );
  else
    consent_at := null;
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_color,
    cm_ticket_id,
    role,
    data_consent_at,
    data_retention_until
  )
  values (
    new.id,
    new.email,
    display,
    picked_color,
    null,
    'participant',
    consent_at,
    case when consent_at is not null then consent_at + interval '6 months' else null end
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(nullif(excluded.display_name, ''), profiles.display_name),
    data_consent_at = coalesce(profiles.data_consent_at, excluded.data_consent_at),
    data_retention_until = coalesce(profiles.data_retention_until, excluded.data_retention_until);

  return new;
end;
$$;
