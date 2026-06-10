-- Game RPCs were granted to PUBLIC; revoking anon alone is not enough.
revoke execute on function public.spin_wheel() from public;
revoke execute on function public.complete_journey_step(text) from public;
revoke execute on function public.complete_challenge_scan(text) from public;
revoke execute on function public.submit_challenge_attempt(text, jsonb, boolean, int) from public;
revoke execute on function public.claim_reward(text, text) from public;
revoke execute on function public.add_photo(text, text, text) from public;
revoke execute on function public.ensure_user_profile() from public;
revoke execute on function public.refresh_profile_points(uuid) from public;
revoke execute on function public.wheel_spins_earned(uuid) from public;
revoke execute on function public.user_photo_count(uuid) from public;

grant execute on function public.spin_wheel() to authenticated;
grant execute on function public.complete_journey_step(text) to authenticated;
grant execute on function public.complete_challenge_scan(text) to authenticated;
grant execute on function public.submit_challenge_attempt(text, jsonb, boolean, int) to authenticated;
grant execute on function public.claim_reward(text, text) to authenticated;
grant execute on function public.add_photo(text, text, text) to authenticated;
grant execute on function public.ensure_user_profile() to authenticated;
grant execute on function public.refresh_profile_points(uuid) to authenticated;
grant execute on function public.wheel_spins_earned(uuid) to authenticated;
grant execute on function public.user_photo_count(uuid) to authenticated;
