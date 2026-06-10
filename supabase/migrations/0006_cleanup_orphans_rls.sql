-- Drop legacy orphan table (not part of gamification schema)
drop table if exists public."User";

-- RLS hardening (re-apply; some tables lost policies on remote)
alter table public.codes enable row level security;
alter table public.wheel_prizes enable row level security;
alter table public.wheel_spins enable row level security;
alter table public.match_score_submissions enable row level security;

drop policy if exists "public_read_codes" on public.codes;
create policy "public_read_codes" on public.codes for select using (true);

drop policy if exists "public_read_wheel_prizes" on public.wheel_prizes;
create policy "public_read_wheel_prizes" on public.wheel_prizes for select using (true);

drop policy if exists "admin_update_wheel_prizes" on public.wheel_prizes;
create policy "admin_update_wheel_prizes" on public.wheel_prizes
  for update using (public.is_admin());

drop policy if exists "own_read_wheel_spins" on public.wheel_spins;
create policy "own_read_wheel_spins" on public.wheel_spins
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "own_read_match_scores" on public.match_score_submissions;
create policy "own_read_match_scores" on public.match_score_submissions
  for select using (user_id = auth.uid() or public.is_admin());

-- poll_votes: RLS was enabled without policies
drop policy if exists "own_read_poll_votes" on public.poll_votes;
create policy "own_read_poll_votes" on public.poll_votes
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "own_insert_poll_votes" on public.poll_votes;
create policy "own_insert_poll_votes" on public.poll_votes
  for insert with check (user_id = auth.uid());

-- Game RPCs: authenticated only (not anon)
revoke execute on function public.spin_wheel() from anon;
revoke execute on function public.complete_journey_step(text) from anon;
revoke execute on function public.complete_challenge_scan(text) from anon;
revoke execute on function public.submit_challenge_attempt(text, jsonb, boolean, int) from anon;
revoke execute on function public.claim_reward(text, text) from anon;
revoke execute on function public.add_photo(text, text, text) from anon;
revoke execute on function public.ensure_user_profile() from anon;
revoke execute on function public.refresh_profile_points(uuid) from anon;
revoke execute on function public.wheel_spins_earned(uuid) from anon;
revoke execute on function public.user_photo_count(uuid) from anon;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.trg_refresh_profile_points() from public;
revoke execute on function public.is_admin() from public;

grant execute on function public.spin_wheel() to authenticated;
grant execute on function public.complete_journey_step(text) to authenticated;
grant execute on function public.complete_challenge_scan(text) to authenticated;
grant execute on function public.submit_challenge_attempt(text, jsonb, boolean, int) to authenticated;
grant execute on function public.claim_reward(text, text) to authenticated;
grant execute on function public.add_photo(text, text, text) to authenticated;
grant execute on function public.ensure_user_profile() to authenticated;
