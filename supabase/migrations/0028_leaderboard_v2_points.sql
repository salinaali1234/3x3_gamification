-- Leaderboard uses unified challenge completions (v2), not legacy profiles.total_points

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
  with scores as (
    select
      p.id as user_id,
      p.display_name,
      p.avatar_color,
      coalesce(sum(c.points_awarded), 0)::int as points,
      count(distinct c.challenge_id) as steps_done,
      coalesce(
        array_agg(distinct b.code order by b.code) filter (where b.code is not null),
        array[]::text[]
      ) as badge_codes
    from public.profiles p
    left join public.challenge_completions_v2 c on c.user_id = p.id
    left join public.user_badges ub on ub.user_id = p.id
    left join public.badges b on b.id = ub.badge_id
    where p.role = 'participant'
    group by p.id, p.display_name, p.avatar_color
  ),
  ranked as (
    select
      row_number() over (order by s.points desc, s.display_name asc) as rank,
      s.user_id,
      s.display_name,
      s.avatar_color,
      s.points,
      s.steps_done,
      s.badge_codes
    from scores s
    where s.points > 0
  )
  select rank, user_id, display_name, avatar_color, points, steps_done, badge_codes
  from ranked
  where rank <= greatest(p_limit, 1)
  order by rank;
$$;

grant execute on function public.get_leaderboard(int) to anon, authenticated;
