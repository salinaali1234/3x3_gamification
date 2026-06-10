-- Match score submission + badge award RPCs (authenticated only)

create or replace function public.submit_match_score(
  p_match_id text,
  p_score text,
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
  pts int;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  if exists (
    select 1 from public.match_score_submissions
    where user_id = uid and match_id = p_match_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already');
  end if;

  insert into public.match_score_submissions (
    user_id, match_id, submitted_score, correct, awarded_points
  )
  values (uid, p_match_id, trim(p_score), p_correct, p_awarded_points);

  pts := public.refresh_profile_points(uid);

  return jsonb_build_object(
    'ok', true,
    'correct', p_correct,
    'awarded_points', p_awarded_points,
    'total_points', pts
  );
end;
$$;

create or replace function public.award_badge(p_badge_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bid uuid;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  select id into bid from public.badges where code = p_badge_code;
  if bid is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_badge');
  end if;

  if exists (
    select 1 from public.user_badges where user_id = uid and badge_id = bid
  ) then
    return jsonb_build_object('ok', false, 'error', 'already');
  end if;

  insert into public.user_badges (user_id, badge_id) values (uid, bid);

  return jsonb_build_object('ok', true, 'badge_code', p_badge_code);
end;
$$;

revoke execute on function public.submit_match_score(text, text, boolean, int) from public;
revoke execute on function public.award_badge(text) from public;

grant execute on function public.submit_match_score(text, text, boolean, int) to authenticated;
grant execute on function public.award_badge(text) to authenticated;
