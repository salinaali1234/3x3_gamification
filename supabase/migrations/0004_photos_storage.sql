-- Photo contest: max 3 uploads per user, Supabase Storage bucket

create or replace function public.user_photo_count(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.photos where user_id = p_user_id;
$$;

create or replace function public.add_photo(
  p_storage_path text,
  p_caption text default '',
  p_hashtag text default '3x3unites'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  photo_id uuid;
  cnt int;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  cnt := public.user_photo_count(uid);
  if cnt >= 3 then
    return jsonb_build_object('ok', false, 'error', 'photo_limit', 'limit', 3);
  end if;

  insert into public.photos (user_id, storage_path, caption, hashtag)
  values (uid, p_storage_path, coalesce(p_caption, ''), coalesce(nullif(trim(p_hashtag), ''), '3x3unites'))
  returning id into photo_id;

  return jsonb_build_object(
    'ok', true,
    'id', photo_id,
    'remaining', 3 - cnt - 1
  );
end;
$$;

grant execute on function public.user_photo_count(uuid) to authenticated;
grant execute on function public.add_photo(text, text, text) to authenticated;

-- Storage bucket (public read for jury / display)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'festival-photos',
  'festival-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies
drop policy if exists "public_read_festival_photos" on storage.objects;
create policy "public_read_festival_photos" on storage.objects
  for select using (bucket_id = 'festival-photos');

drop policy if exists "users_upload_own_photos" on storage.objects;
create policy "users_upload_own_photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'festival-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users_delete_own_photos" on storage.objects;
create policy "users_delete_own_photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'festival-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
