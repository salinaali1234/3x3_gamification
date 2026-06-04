-- Wheel spins: unlock after ALL main quest journey steps (not points-based)

create or replace function public.wheel_spins_earned(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select (
    case
      when (
        select count(*)::int from public.step_completions where user_id = p_user_id
      ) >= (
        select count(*)::int from public.journey_steps
      )
      and (select count(*)::int from public.journey_steps) > 0
      then 1
      else 0
    end
  ) + (
    select count(*)::int from public.wheel_spins
    where user_id = p_user_id and prize_id = 'wp-spin-again'
  );
$$;

create or replace function public.spin_wheel()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  earned_spins int;
  used_spins int;
  available int;
  prize record;
  r float;
  acc float := 0;
  total_weight float;
  spin_id uuid;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  earned_spins := public.wheel_spins_earned(uid);
  used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);
  available := earned_spins - used_spins;

  if available < 1 then
    return jsonb_build_object('ok', false, 'error', 'no_spins');
  end if;

  select sum(weight)::float into total_weight
  from public.wheel_prizes
  where unlimited or stock > 0;

  if total_weight is null or total_weight <= 0 then
    return jsonb_build_object('ok', false, 'error', 'no_prizes');
  end if;

  r := random() * total_weight;

  for prize in
    select *
    from public.wheel_prizes
    where unlimited or stock > 0
    order by id
  loop
    acc := acc + prize.weight;
    if r <= acc then
      insert into public.wheel_spins (user_id, prize_id)
      values (uid, prize.id)
      returning id into spin_id;

      if not prize.unlimited and prize.stock > 0 then
        update public.wheel_prizes
        set stock = stock - 1
        where id = prize.id and stock > 0;
      end if;

      earned_spins := public.wheel_spins_earned(uid);
      used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);

      return jsonb_build_object(
        'ok', true,
        'spin_id', spin_id,
        'prize', jsonb_build_object(
          'id', prize.id,
          'emoji', prize.emoji,
          'label_nl', prize.label_nl,
          'label_en', prize.label_en
        ),
        'spins_remaining', earned_spins - used_spins,
        'spins_earned', earned_spins
      );
    end if;
  end loop;

  return jsonb_build_object('ok', false, 'error', 'no_prizes');
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
    'points_gained', step.points,
    'total_points', pts,
    'wheel_spins_gained', earned_spins - spins_before,
    'wheel_spins_available', earned_spins - used_spins,
    'journey_steps_done', steps_done,
    'journey_steps_total', steps_total,
    'journey_complete', steps_done >= steps_total
  );
end;
$$;

create or replace function public.complete_challenge_scan(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ch record;
  pts int;
  earned_spins int;
  used_spins int;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select * into ch from public.challenges where slug = p_slug limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  if exists (
    select 1 from public.challenge_attempts
    where user_id = uid and challenge_id = ch.id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already');
  end if;

  insert into public.challenge_attempts (
    user_id, challenge_id, answer, correct, awarded_points
  ) values (
    uid, ch.id, jsonb_build_object('scanned', true), true, ch.points
  );

  pts := public.refresh_profile_points(uid);
  earned_spins := public.wheel_spins_earned(uid);
  used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);

  return jsonb_build_object(
    'ok', true,
    'type', 'challenge',
    'points_gained', ch.points,
    'total_points', pts,
    'wheel_spins_gained', 0,
    'wheel_spins_available', earned_spins - used_spins
  );
end;
$$;

grant execute on function public.wheel_spins_earned(uuid) to authenticated;
