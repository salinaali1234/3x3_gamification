-- 0015_unified_challenges.sql
-- Unified challenges + prize tiers (replaces journey, wheel, side challenges, rewards).
-- Old tables left in place for now; the app will only read the new ones.

-- ---------- Challenges ----------
create table if not exists challenges_v2 (
  id text primary key,                      -- slug, e.g. "skills-showdown"
  location text not null,                   -- "3X3 Unites Area", "Kids Area", ...
  sort_order int not null default 0,        -- order within a location
  title text not null,
  subtitle text not null,
  description text not null,
  points int not null check (points >= 0),
  verification text not null check (verification in ('code','manual','photo','fence')),
  code text,                                -- required when verification = 'code'
  letters text[],                           -- 10-letter solution for fence challenge
  day_flag text check (day_flag in ('friday','saturday')),
  accent text not null default 'green' check (accent in ('green','orange','blue')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table challenges_v2 add column if not exists subtitle text;

update challenges_v2
set subtitle = title
where subtitle is null or subtitle = '';

alter table challenges_v2 alter column subtitle set not null;

create unique index if not exists challenges_v2_code_uniq
  on challenges_v2 (lower(code))
  where verification = 'code' and active = true;

-- ---------- Completions ----------
create table if not exists challenge_completions_v2 (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null references challenges_v2(id) on delete cascade,
  points_awarded int not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

create index if not exists challenge_completions_v2_user
  on challenge_completions_v2 (user_id);

-- ---------- Prize tiers ----------
create table if not exists prize_tiers (
  id text primary key,                      -- slug, e.g. "tier-1"
  sort_order int not null,                  -- fixed display order
  name text not null,
  description text,
  cost_points int not null check (cost_points > 0),
  stock int not null default -1,            -- -1 = unlimited
  emoji text,
  accent text not null default 'green' check (accent in ('green','orange','blue')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Redemptions ----------
create table if not exists prize_redemptions_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier_id text not null references prize_tiers(id),
  cost_points int not null,                 -- snapshot of cost at redemption time
  voucher_code text not null unique,
  claimed_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create index if not exists prize_redemptions_v2_user
  on prize_redemptions_v2 (user_id);

-- ---------- Helper view: points balance ----------
create or replace view user_points_v2 as
  select
    u.id as user_id,
    coalesce(
      (select sum(points_awarded) from challenge_completions_v2 c where c.user_id = u.id), 0
    ) as points_earned,
    coalesce(
      (select sum(cost_points) from prize_redemptions_v2 r where r.user_id = u.id), 0
    ) as points_spent,
    coalesce(
      (select sum(points_awarded) from challenge_completions_v2 c where c.user_id = u.id), 0
    ) - coalesce(
      (select sum(cost_points) from prize_redemptions_v2 r where r.user_id = u.id), 0
    ) as points_balance
  from auth.users u;

-- ---------- RLS ----------
alter table challenges_v2 enable row level security;
alter table challenge_completions_v2 enable row level security;
alter table prize_tiers enable row level security;
alter table prize_redemptions_v2 enable row level security;

drop policy if exists "anyone can read challenges" on challenges_v2;
create policy "anyone can read challenges" on challenges_v2
  for select using (true);

drop policy if exists "anyone can read prize tiers" on prize_tiers;
create policy "anyone can read prize tiers" on prize_tiers
  for select using (true);

drop policy if exists "user reads own completions" on challenge_completions_v2;
create policy "user reads own completions" on challenge_completions_v2
  for select using (auth.uid() = user_id);

drop policy if exists "user inserts own completions" on challenge_completions_v2;
create policy "user inserts own completions" on challenge_completions_v2
  for insert with check (auth.uid() = user_id);

drop policy if exists "user reads own redemptions" on prize_redemptions_v2;
create policy "user reads own redemptions" on prize_redemptions_v2
  for select using (auth.uid() = user_id);

-- Redemptions are written via a SECURITY DEFINER RPC so points balance is enforced server-side.

-- ---------- RPC: complete challenge ----------
create or replace function complete_challenge_v2(
  p_challenge_id text,
  p_submitted_code text default null
) returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_chal challenges_v2;
  v_points_awarded int;
  v_existing int;
begin
  if v_user is null then
    return json_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select * into v_chal from challenges_v2 where id = p_challenge_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'invalid_challenge');
  end if;

  select count(*) into v_existing
    from challenge_completions_v2
    where user_id = v_user and challenge_id = v_chal.id;
  if v_existing > 0 then
    return json_build_object('ok', false, 'error', 'already_completed');
  end if;

  if v_chal.verification = 'code' then
    if p_submitted_code is null or lower(trim(p_submitted_code)) <> lower(trim(v_chal.code)) then
      return json_build_object('ok', false, 'error', 'wrong_code');
    end if;
  elsif v_chal.verification = 'fence' then
    if p_submitted_code is null
       or upper(regexp_replace(p_submitted_code, '\s', '', 'g'))
          <> upper(array_to_string(v_chal.letters, ''))
    then
      return json_build_object('ok', false, 'error', 'wrong_letters');
    end if;
  end if;

  v_points_awarded := v_chal.points;

  insert into challenge_completions_v2 (user_id, challenge_id, points_awarded)
    values (v_user, v_chal.id, v_points_awarded);

  return json_build_object(
    'ok', true,
    'points_awarded', v_points_awarded,
    'challenge_id', v_chal.id
  );
end $$;

revoke all on function complete_challenge_v2(text, text) from public;
grant execute on function complete_challenge_v2(text, text) to authenticated;

-- ---------- RPC: redeem prize tier (spends points) ----------
create or replace function redeem_prize_tier(
  p_tier_id text
) returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tier prize_tiers;
  v_balance int;
  v_voucher text;
begin
  if v_user is null then
    return json_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select * into v_tier from prize_tiers where id = p_tier_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'invalid_tier');
  end if;

  select points_balance into v_balance from user_points_v2 where user_id = v_user;
  if coalesce(v_balance, 0) < v_tier.cost_points then
    return json_build_object('ok', false, 'error', 'insufficient_points', 'balance', v_balance);
  end if;

  if v_tier.stock = 0 then
    return json_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  v_voucher := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into prize_redemptions_v2 (user_id, tier_id, cost_points, voucher_code)
    values (v_user, v_tier.id, v_tier.cost_points, v_voucher);

  if v_tier.stock > 0 then
    update prize_tiers set stock = stock - 1 where id = v_tier.id;
  end if;

  return json_build_object(
    'ok', true,
    'voucher_code', v_voucher,
    'cost', v_tier.cost_points
  );
end $$;

revoke all on function redeem_prize_tier(text) from public;
grant execute on function redeem_prize_tier(text) to authenticated;

-- ---------- Seed: the 23 unified challenges ----------
insert into challenges_v2 (id, location, sort_order, title, subtitle, description, points, verification, code, letters, day_flag, accent, active) values
  ('skills-showdown',         '3X3 Unites Area',     10, 'Skills Showdown',        'Discover your 3x3 player abilities at the Skills Showdown', 'Test your shooting, dribbling and reaction skills at the Skills Showdown. Get your code from the leader at the booth.', 75, 'code', 'SKILLS-2026', null, null, 'green', true),
  ('leaderhub-clinic',        '3X3 Unites Area',     20, 'LeaderHub Clinic',       'Sign up at the LeaderHub for a 3x3 clinic or trial leader course', 'Join a clinic or sign up as a trial 3x3 leader at the LeaderHub. Leaders give you a unique code on completion.', 200, 'code', 'LEADER-200', null, null, 'green', true),
  ('learn-about-leaders',     '3X3 Unites Area',     30, 'Meet Our Leaders',       'Learn more about 3X3 Unites from our Leaders at the LeaderHub', 'Stop by the LeaderHub, hear the story behind our leader program and grab the code.', 75, 'code', 'HUB-LEARN', null, null, 'green', true),
  ('shon-price-live-art',     'Kids Area',           10, 'Live Art',               'Help Shon Price paint his live art piece at the Kids Area', 'Pick up a brush and contribute to the live art piece — mark it done when you''ve helped.', 50, 'manual', null, null, null, 'orange', true),
  ('godrip-cornhole',         'Kids Area',           20, 'GoDrip Challenge',       'Challenge GoDrip in cornhole or bucket shooting at the Kids Area', 'Take on GoDrip in a quick game — bucket shooting or cornhole. Mark it done when finished.', 50, 'manual', null, null, null, 'orange', true),
  ('vriendenloterij-trivia',  'Community Corner',    10, 'Sports Trivia',          'Play sports trivia at the VriendenLoterij locker rooms', 'Test your sports knowledge at the VriendenLoterij locker rooms.', 50, 'manual', null, null, null, 'blue', true),
  ('sneakerness-shoelacing',  'Community Corner',    20, 'Shoelacing Challenge',   'Attempt the Sneakerness shoelacing challenge under the tarp', 'Lace your sneakers fast and clean under the tarp at the Community Corner. Code from the leader.', 100, 'code', 'LACE-100', null, null, 'blue', true),
  ('triple-threat-barber',    'Community Corner',    30, 'Triple Threat Barber',   'Freshen up your haircut at the Triple Threat BarberShop', 'Get a quick fade or trim at the Triple Threat BarberShop, then enter the leader code.', 100, 'code', 'FADE-100', null, null, 'blue', true),
  ('talent-movement-music',   'Community Corner',    40, 'Talent Movement',        'Groove and make music at the Talent Movement van', 'Stop by the Talent Movement van, jam along and mark it done.', 50, 'manual', null, null, null, 'blue', true),
  ('street-league-watch',     'The Streets',         10, 'Street League',          'Dive into The Streets and watch a Street League game', 'Find a spot at The Streets and watch a full Street League game. Code from the leader at the court.', 200, 'code', 'STREET-200', null, null, 'green', true),
  ('kfc-court-hangout',       'The Streets',         20, 'KFC Court',              'Hangout and play some challenges on the KFC court', 'Spend time at the KFC court, join a casual game and mark it done.', 25, 'manual', null, null, null, 'green', true),
  ('dunking-devils-show',     'Warm-Up Court',       10, 'Dunking Devils',         'Watch the craziest flips and dunks from the Dunking Devils show in front of the stadium', 'Catch the Dunking Devils performing in front of the stadium.', 75, 'manual', null, null, null, 'orange', true),
  ('pro-warmup-watch',        'Warm-Up Court',       20, 'Pro Warm-Up',            'Watch the 3x3 professionals get ready for their World Tour / Women''s Series match', 'Watch the pros prepare at the Warm-Up Court before they hit the main stage.', 25, 'manual', null, null, null, 'orange', true),
  ('panna-ko-watch',          'Panna Courts',        10, 'Panna KO',               'Watch the intensity and flare of Panna KO street ballers at the panna cages', 'Catch the Panna KO street ballers at the panna cages.', 75, 'manual', null, null, null, 'blue', true),
  ('breakdance-battles',      'Panna Courts',        20, 'Break Dance Battles',    'Experience the energy and vibes from the Break Dance Battles at the panna cages', 'Catch the Break Dance Battles at the panna cages.', 25, 'manual', null, null, 'saturday', 'blue', true),
  ('one-vs-one-leaders',      'Side Events Court',   10, '1v1 vs Leaders',         'Take part on the 1v1 challenge versus 3x3 Unites leaders from all over the country', 'Sign up for a 1v1 versus a 3x3 Unites leader. Leader hands out the code after your match.', 75, 'code', 'ONE-V-ONE', null, null, 'green', true),
  ('nbb-clinic',              'Side Events Court',   20, 'NBB Clinic',             'Join in on the 3x3 basketball clinic given by the Nederlandse Basketball Bond (NBB)', 'Join the NBB clinic at the side events court.', 50, 'manual', null, null, 'friday', 'green', true),
  ('shootout-challenge',      'Side Events Court',   30, 'Shootout',               'Take part in the Shootout challenge at the side events court', 'Take three shots from the line. Code from the leader.', 100, 'code', 'SHOOT-100', null, null, 'green', true),
  ('meet-greet-teams',        'Side Events Court',   40, 'Meet & Greet',           'Meet & Greet the 3x3 professional mens and womens basketball team', 'Get a photo or autograph with the pro teams. Mark it done.', 25, 'manual', null, null, null, 'green', true),
  ('rabobank-arcade',         'Side Events Court',   50, 'Rabobank Arcade',        'Challenge a leader to play the Rabobank basketball arcade game in front of De Waaier', 'Beat (or be beaten by) a leader on the Rabobank arcade game. Leader gives the code.', 50, 'code', 'WAAIER-50', null, null, 'orange', true),
  ('leader-conversations',    'Interactive Dome',    10, 'Leader Talks',           'Tune in to conversations about 3X3 Unites and the achieved impact over the last 10 years', 'Listen to the leaders talk impact at the Interactive Dome.', 100, 'code', 'DOME-100', null, null, 'blue', true),
  ('dome-immersive-video',    'Interactive Dome',    20, 'Immersive Video',        'Experience the first ever 3x3 basketball immersive video experience at the dome', 'Step into the immersive video experience — pick up the code on your way out.', 200, 'code', 'DOME-IMMERSIVE', null, null, 'blue', true),
  ('odido-arcade-outside',    'Interactive Dome',    30, 'ODIDO Arcade',           'Try out the ODIDO basketball arcade outside the Interactive Dome', 'Try the ODIDO arcade outside the dome and mark it done.', 25, 'manual', null, null, null, 'blue', true),
  ('fence-leaders',           'Fence Installations', 10, 'Fence Leaders',          'Meet all 10 fence leaders in real life for a special reward', 'The leaders on the fences are here on the grounds! Meet all 10 in real life — each one gives you one letter. Enter all 10 letters in the correct order on this challenge to form the secret word and claim 333 points.', 333, 'fence', null, ARRAY['S','T','R','E','E','T','G','A','M','E'], null, 'orange', true)
on conflict (id) do update set
  location = excluded.location,
  sort_order = excluded.sort_order,
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  points = excluded.points,
  verification = excluded.verification,
  code = excluded.code,
  letters = excluded.letters,
  day_flag = excluded.day_flag,
  accent = excluded.accent,
  active = excluded.active;

-- ---------- Seed: placeholder prize tiers ----------
insert into prize_tiers (id, sort_order, name, description, cost_points, stock, emoji, accent, active) values
  ('tier-bronze',   10, 'Bronze Reward',   'Placeholder — first reachable prize tier. Details TBD.',     250, -1, '🥉', 'orange', true),
  ('tier-silver',   20, 'Silver Reward',   'Placeholder — mid-tier prize. Details TBD.',                 600, -1, '🥈', 'blue',   true),
  ('tier-gold',     30, 'Gold Reward',     'Placeholder — high-value prize. Details TBD.',              1200, -1, '🥇', 'green',  true),
  ('tier-platinum', 40, 'Platinum Reward', 'Placeholder — top-tier prize, signed merch / VIP. Details TBD.', 2000, -1, '🏆', 'green',  true)
on conflict (id) do update set
  sort_order = excluded.sort_order,
  name = excluded.name,
  description = excluded.description,
  cost_points = excluded.cost_points,
  stock = excluded.stock,
  emoji = excluded.emoji,
  accent = excluded.accent,
  active = excluded.active;
