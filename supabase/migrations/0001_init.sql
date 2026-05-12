-- 3x3 Unites gamification — Supabase schema (for future real integration)
-- NOTE: the current Next.js mockup uses an in-memory store; this SQL is provided
-- so the production wiring can drop in once a Supabase project is created.

create extension if not exists "uuid-ossp";

-- Profiles ------------------------------------------------------------
create type role as enum ('participant', 'admin');

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  cm_ticket_id text unique,
  display_name text not null,
  email text unique not null,
  avatar_color text not null default '#BEFF00',
  role role not null default 'participant',
  total_points int not null default 0,
  created_at timestamptz not null default now()
);

-- Journey -------------------------------------------------------------
create table journey_steps (
  id uuid primary key default uuid_generate_v4(),
  step_order int unique not null,
  code text unique not null,
  title_nl text not null,
  title_en text not null,
  location_nl text not null,
  location_en text not null,
  description_nl text,
  description_en text,
  points int not null default 0,
  accent text not null default 'orange'
);

create table step_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  step_id uuid not null references journey_steps(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, step_id)
);

create index on step_completions (user_id);

-- QR codes ------------------------------------------------------------
create type qr_target as enum ('step', 'challenge');

create table qr_codes (
  code text primary key,
  target_type qr_target not null,
  target_id uuid not null,
  active boolean not null default true
);

-- Challenges ----------------------------------------------------------
create type challenge_type as enum ('trivia','poll','score_input','photo','bingo','panna_qr');

create table challenges (
  id uuid primary key default uuid_generate_v4(),
  type challenge_type not null,
  title_nl text not null,
  title_en text not null,
  description_nl text,
  description_en text,
  points int not null default 0,
  accent text not null default 'green',
  payload jsonb not null
);

create table challenge_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  answer jsonb,
  correct boolean not null default false,
  awarded_points int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create table poll_votes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  option_index int not null,
  voted_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

-- Badges --------------------------------------------------------------
create table badges (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name_nl text not null,
  name_en text not null,
  description_nl text,
  description_en text,
  emoji text not null,
  accent text not null default 'green',
  criterion jsonb not null
);

create table user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- Photos --------------------------------------------------------------
create table photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  caption text default '',
  hashtag text default '3x3unites',
  created_at timestamptz not null default now()
);

create table photo_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  photo_id uuid not null references photos(id) on delete cascade,
  primary key (user_id, photo_id)
);

-- Rewards -------------------------------------------------------------
create type reward_type as enum ('food','water','merch_voucher','autograph','speaker');

create table rewards (
  id uuid primary key default uuid_generate_v4(),
  name_nl text not null,
  name_en text not null,
  description_nl text,
  description_en text,
  type reward_type not null,
  cost_points int not null,
  stock int not null default 0,
  emoji text not null,
  accent text not null default 'green'
);

create table reward_claims (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  reward_id uuid not null references rewards(id) on delete cascade,
  voucher_code text not null,
  claimed_at timestamptz not null default now()
);

-- RLS ------------------------------------------------------------------
alter table profiles enable row level security;
alter table step_completions enable row level security;
alter table challenge_attempts enable row level security;
alter table poll_votes enable row level security;
alter table user_badges enable row level security;
alter table photos enable row level security;
alter table photo_likes enable row level security;
alter table reward_claims enable row level security;

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean
language sql security definer set search_path = public
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

-- profiles: own row visible always; admins see all
create policy "self_read" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "self_update" on profiles for update
  using (auth.uid() = id);

-- step_completions: own + admins
create policy "own_read_steps" on step_completions for select
  using (user_id = auth.uid() or is_admin());
create policy "own_insert_steps" on step_completions for insert
  with check (user_id = auth.uid());

-- challenge_attempts
create policy "own_read_att" on challenge_attempts for select
  using (user_id = auth.uid() or is_admin());
create policy "own_insert_att" on challenge_attempts for insert
  with check (user_id = auth.uid());

-- public read for catalog tables (journey_steps, challenges, badges, rewards)
alter table journey_steps enable row level security;
create policy "public_read_js" on journey_steps for select using (true);
alter table challenges enable row level security;
create policy "public_read_ch" on challenges for select using (true);
alter table badges enable row level security;
create policy "public_read_bd" on badges for select using (true);
alter table rewards enable row level security;
create policy "public_read_rw" on rewards for select using (true);

-- photos: public read, own write
create policy "public_read_photos" on photos for select using (true);
create policy "own_insert_photos" on photos for insert with check (user_id = auth.uid());
create policy "public_read_likes" on photo_likes for select using (true);
create policy "own_likes" on photo_likes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- user_badges: own + admin read; only system function can insert (use service role)
create policy "own_read_ub" on user_badges for select using (user_id = auth.uid() or is_admin());

-- reward_claims: own + admin
create policy "own_read_claim" on reward_claims for select using (user_id = auth.uid() or is_admin());
create policy "own_insert_claim" on reward_claims for insert with check (user_id = auth.uid());
