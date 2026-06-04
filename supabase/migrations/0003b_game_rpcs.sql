-- RPCs, RLS policies, grants (part 2 of game persistence)

create or replace function public.spin_wheel()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  total_pts int;
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

  total_pts := public.refresh_profile_points(uid);
  earned_spins := floor(total_pts / 200)::int + (
    select count(*)::int from public.wheel_spins
    where user_id = uid and prize_id = 'wp-spin-again'
  );
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

      earned_spins := floor(total_pts / 200)::int + (
        select count(*)::int from public.wheel_spins
        where user_id = uid and prize_id = 'wp-spin-again'
      );
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
        'spins_earned', earned_spins,
        'total_points', total_pts
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

  pts := public.refresh_profile_points(uid);
  spins_before := floor(pts / 200)::int + (
    select count(*)::int from public.wheel_spins
    where user_id = uid and prize_id = 'wp-spin-again'
  );

  insert into public.step_completions (user_id, step_id) values (uid, step.id);

  pts := public.refresh_profile_points(uid);
  earned_spins := floor(pts / 200)::int + (
    select count(*)::int from public.wheel_spins
    where user_id = uid and prize_id = 'wp-spin-again'
  );
  used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);

  return jsonb_build_object(
    'ok', true,
    'type', 'step',
    'points_gained', step.points,
    'total_points', pts,
    'wheel_spins_gained', earned_spins - spins_before,
    'wheel_spins_available', earned_spins - used_spins,
    'next_wheel_at', 200 - (pts % 200)
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
  spins_before int;
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

  pts := public.refresh_profile_points(uid);
  spins_before := floor(pts / 200)::int + (
    select count(*)::int from public.wheel_spins
    where user_id = uid and prize_id = 'wp-spin-again'
  );

  insert into public.challenge_attempts (
    user_id, challenge_id, answer, correct, awarded_points
  ) values (
    uid, ch.id, jsonb_build_object('scanned', true), true, ch.points
  );

  pts := public.refresh_profile_points(uid);
  earned_spins := floor(pts / 200)::int + (
    select count(*)::int from public.wheel_spins
    where user_id = uid and prize_id = 'wp-spin-again'
  );
  used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);

  return jsonb_build_object(
    'ok', true,
    'type', 'challenge',
    'points_gained', ch.points,
    'total_points', pts,
    'wheel_spins_gained', earned_spins - spins_before,
    'wheel_spins_available', earned_spins - used_spins
  );
end;
$$;

create or replace function public.submit_challenge_attempt(
  p_slug text,
  p_answer jsonb,
  p_correct boolean,
  p_awarded_points int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ch record;
  pts int;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select * into ch from public.challenges where slug = p_slug limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
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
    uid, ch.id, p_answer, p_correct, p_awarded_points
  );

  pts := public.refresh_profile_points(uid);

  return jsonb_build_object(
    'ok', true,
    'correct', p_correct,
    'awarded', p_awarded_points,
    'total_points', pts
  );
end;
$$;

create or replace function public.claim_reward(p_slug text, p_voucher_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rw record;
  pts int;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select * into rw from public.rewards where slug = p_slug limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if rw.stock <= 0 then
    return jsonb_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  if exists (
    select 1 from public.reward_claims
    where user_id = uid and reward_id = rw.id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_claimed');
  end if;

  pts := public.refresh_profile_points(uid);
  if pts < rw.cost_points then
    return jsonb_build_object('ok', false, 'error', 'not_enough_points');
  end if;

  update public.rewards set stock = stock - 1 where id = rw.id and stock > 0;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  insert into public.reward_claims (user_id, reward_id, voucher_code)
  values (uid, rw.id, p_voucher_code);

  return jsonb_build_object('ok', true, 'code', p_voucher_code);
end;
$$;

alter table public.wheel_prizes enable row level security;
alter table public.wheel_spins enable row level security;
alter table public.match_score_submissions enable row level security;

drop policy if exists "public_read_wheel_prizes" on public.wheel_prizes;
create policy "public_read_wheel_prizes" on public.wheel_prizes for select using (true);

drop policy if exists "own_read_wheel_spins" on public.wheel_spins;
create policy "own_read_wheel_spins" on public.wheel_spins
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "own_read_match_scores" on public.match_score_submissions;
create policy "own_read_match_scores" on public.match_score_submissions
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_update_wheel_prizes" on public.wheel_prizes;
create policy "admin_update_wheel_prizes" on public.wheel_prizes
  for update using (public.is_admin());

drop policy if exists "admin_update_rewards_stock" on public.rewards;
create policy "admin_update_rewards_stock" on public.rewards
  for update using (public.is_admin());

alter table public.codes enable row level security;
drop policy if exists "public_read_codes" on public.codes;
create policy "public_read_codes" on public.codes for select using (true);

grant execute on function public.spin_wheel() to authenticated;
grant execute on function public.complete_journey_step(text) to authenticated;
grant execute on function public.complete_challenge_scan(text) to authenticated;
grant execute on function public.submit_challenge_attempt(text, jsonb, boolean, int) to authenticated;
grant execute on function public.claim_reward(text, text) to authenticated;
grant execute on function public.refresh_profile_points(uuid) to authenticated;
