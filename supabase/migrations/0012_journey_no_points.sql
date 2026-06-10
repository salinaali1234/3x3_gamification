-- Main quests unlock the wheel only; they do not award shop/leaderboard points.

create or replace function public.refresh_profile_points(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  pts int;
begin
  pts := public.challenge_pass_points(p_user_id);

  update public.profiles
  set total_points = pts
  where id = p_user_id;

  return pts;
end;
$$;

create or replace function public.complete_journey_step(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  step record;
  pts int;
  earned_spins int;
  used_spins int;
  spins_before int;
  steps_done int;
  steps_total int;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select * into step from public.journey_steps where slug = p_slug limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  if exists (
    select 1 from public.step_completions
    where user_id = uid and step_id = step.id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already');
  end if;

  spins_before := public.wheel_spins_earned(uid);

  insert into public.step_completions (user_id, step_id) values (uid, step.id);

  pts := public.refresh_profile_points(uid);
  earned_spins := public.wheel_spins_earned(uid);
  used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);
  steps_done := (select count(*)::int from public.step_completions where user_id = uid);
  steps_total := (select count(*)::int from public.journey_steps);

  return jsonb_build_object(
    'ok', true,
    'type', 'step',
    'points_gained', 0,
    'total_points', pts,
    'wheel_spins_gained', earned_spins - spins_before,
    'wheel_spins_available', earned_spins - used_spins,
    'journey_steps_done', steps_done,
    'journey_steps_total', steps_total,
    'journey_complete', steps_done >= steps_total
  );
end;
$$;

-- Recalculate stored totals for all profiles (drop inflated journey points).
select public.refresh_profile_points(id) from public.profiles;
