-- Live matches catalog + public leaderboard RPC

create table if not exists public.live_matches (
  id text primary key,
  day text not null check (day in ('friday', 'saturday', 'sunday')),
  start_time text not null,
  label_nl text not null,
  label_en text not null,
  team_a text not null,
  team_b text not null,
  final_score text,
  updated_at timestamptz not null default now()
);

create index if not exists live_matches_day_idx on public.live_matches (day, start_time);

alter table public.live_matches enable row level security;

drop policy if exists "public_read_live_matches" on public.live_matches;
create policy "public_read_live_matches" on public.live_matches for select using (true);

drop policy if exists "admin_update_live_matches" on public.live_matches;
create policy "admin_update_live_matches" on public.live_matches
  for update using (public.is_admin());

create or replace function public.get_leaderboard(p_limit int default 100)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_color text,
  points int,
  steps_done bigint,
  badge_codes text[]
)
language sql
security definer
set search_path = public
stable
as $$
  with ranked as (
    select
      row_number() over (order by p.total_points desc, p.display_name asc) as rank,
      p.id as user_id,
      p.display_name,
      p.avatar_color,
      p.total_points as points,
      count(distinct sc.id) as steps_done,
      coalesce(
        array_agg(distinct b.code order by b.code) filter (where b.code is not null),
        array[]::text[]
      ) as badge_codes
    from public.profiles p
    left join public.step_completions sc on sc.user_id = p.id
    left join public.user_badges ub on ub.user_id = p.id
    left join public.badges b on b.id = ub.badge_id
    where p.role = 'participant'
    group by p.id, p.display_name, p.avatar_color, p.total_points
  )
  select rank, user_id, display_name, avatar_color, points, steps_done, badge_codes
  from ranked
  where rank <= greatest(p_limit, 1)
  order by rank;
$$;

create or replace function public.set_live_match_final_score(
  p_match_id text,
  p_final_score text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  update public.live_matches
  set
    final_score = nullif(trim(p_final_score), ''),
    updated_at = now()
  where id = p_match_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  return jsonb_build_object(
    'ok', true,
    'match_id', p_match_id,
    'final_score', nullif(trim(p_final_score), '')
  );
end;
$$;

revoke execute on function public.get_leaderboard(int) from public;
revoke execute on function public.set_live_match_final_score(text, text) from public;

grant execute on function public.get_leaderboard(int) to anon, authenticated;
grant execute on function public.set_live_match_final_score(text, text) to authenticated;
