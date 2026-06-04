-- Game persistence: wheel stock, user progress RPCs, catalog bootstrap

-- ---------------------------------------------------------------------------
-- Wheel prizes & spins
-- ---------------------------------------------------------------------------
create table if not exists public.wheel_prizes (
  id text primary key,
  label_nl text not null,
  label_en text not null,
  emoji text not null,
  weight int not null default 1 check (weight > 0),
  stock int not null default 0,
  unlimited boolean not null default false
);

create table if not exists public.wheel_spins (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prize_id text not null references public.wheel_prizes(id),
  created_at timestamptz not null default now()
);

create index if not exists wheel_spins_user_id_idx on public.wheel_spins (user_id);

-- Match score submissions (live match predictions)
create table if not exists public.match_score_submissions (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id text not null,
  submitted_score text not null,
  correct boolean not null default false,
  awarded_points int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists match_score_submissions_user_id_idx
  on public.match_score_submissions (user_id);

-- Slugs bridge in-memory seed ids to Supabase UUID rows
alter table public.journey_steps
  add column if not exists slug text unique;

alter table public.challenges
  add column if not exists slug text unique;

alter table public.rewards
  add column if not exists slug text unique;

-- ---------------------------------------------------------------------------
-- Keep profiles.total_points in sync
-- ---------------------------------------------------------------------------
create or replace function public.refresh_profile_points(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  pts int;
begin
  select
    coalesce((
      select sum(js.points)
      from public.step_completions sc
      join public.journey_steps js on js.id = sc.step_id
      where sc.user_id = p_user_id
    ), 0)
    + coalesce((
      select sum(ca.awarded_points)
      from public.challenge_attempts ca
      where ca.user_id = p_user_id
    ), 0)
    + coalesce((
      select sum(mss.awarded_points)
      from public.match_score_submissions mss
      where mss.user_id = p_user_id
    ), 0)
  into pts;

  update public.profiles
  set total_points = pts
  where id = p_user_id;

  return pts;
end;
$$;

create or replace function public.trg_refresh_profile_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_profile_points(
    coalesce(new.user_id, old.user_id)
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_points_after_step on public.step_completions;
create trigger refresh_points_after_step
  after insert or delete on public.step_completions
  for each row execute function public.trg_refresh_profile_points();

drop trigger if exists refresh_points_after_attempt on public.challenge_attempts;
create trigger refresh_points_after_attempt
  after insert or delete on public.challenge_attempts
  for each row execute function public.trg_refresh_profile_points();

drop trigger if exists refresh_points_after_match on public.match_score_submissions;
create trigger refresh_points_after_match
  after insert or delete on public.match_score_submissions
  for each row execute function public.trg_refresh_profile_points();

-- ---------------------------------------------------------------------------
-- Wheel spin (atomic stock decrement)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Redeem journey step by slug
-- ---------------------------------------------------------------------------
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

  select * into step
  from public.journey_steps
  where slug = p_slug
  limit 1;

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

  insert into public.step_completions (user_id, step_id)
  values (uid, step.id);

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

-- ---------------------------------------------------------------------------
-- Redeem side challenge via scan code (panna_qr style)
-- ---------------------------------------------------------------------------
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

  select * into ch
  from public.challenges
  where slug = p_slug
  limit 1;

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

-- ---------------------------------------------------------------------------
-- Challenge attempt (trivia, poll, etc.)
-- ---------------------------------------------------------------------------
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

  select * into ch
  from public.challenges
  where slug = p_slug
  limit 1;

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

-- ---------------------------------------------------------------------------
-- Claim reward shop item (atomic stock)
-- ---------------------------------------------------------------------------
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

  select * into rw
  from public.rewards
  where slug = p_slug
  limit 1;

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

  update public.rewards
  set stock = stock - 1
  where id = rw.id and stock > 0;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  insert into public.reward_claims (user_id, reward_id, voucher_code)
  values (uid, rw.id, p_voucher_code);

  return jsonb_build_object('ok', true, 'code', p_voucher_code);
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.wheel_prizes enable row level security;
alter table public.wheel_spins enable row level security;
alter table public.match_score_submissions enable row level security;

create policy "public_read_wheel_prizes" on public.wheel_prizes
  for select using (true);

create policy "own_read_wheel_spins" on public.wheel_spins
  for select using (user_id = auth.uid() or public.is_admin());

create policy "own_read_match_scores" on public.match_score_submissions
  for select using (user_id = auth.uid() or public.is_admin());

-- Admins can update stock
create policy "admin_update_wheel_prizes" on public.wheel_prizes
  for update using (public.is_admin());

create policy "admin_update_rewards_stock" on public.rewards
  for update using (public.is_admin());

-- Codes: enable RLS with public read
alter table public.codes enable row level security;
create policy "public_read_codes" on public.codes for select using (true);

-- RPC grants
grant execute on function public.spin_wheel() to authenticated;
grant execute on function public.complete_journey_step(text) to authenticated;
grant execute on function public.complete_challenge_scan(text) to authenticated;
grant execute on function public.submit_challenge_attempt(text, jsonb, boolean, int) to authenticated;
grant execute on function public.claim_reward(text, text) to authenticated;
grant execute on function public.refresh_profile_points(uuid) to authenticated;
