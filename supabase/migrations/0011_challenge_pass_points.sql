-- Challenge Pass claims use side-challenge + match score points only (not journey).

create or replace function public.challenge_pass_points(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((
      select sum(ca.awarded_points)
      from public.challenge_attempts ca
      where ca.user_id = p_user_id
    ), 0)
    + coalesce((
      select sum(mss.awarded_points)
      from public.match_score_submissions mss
      where mss.user_id = p_user_id
    ), 0);
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

  pts := public.challenge_pass_points(uid);
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

  return jsonb_build_object(
    'ok', true,
    'code', p_voucher_code,
    'challenge_pass_points', pts
  );
end;
$$;

revoke execute on function public.challenge_pass_points(uuid) from public;
grant execute on function public.challenge_pass_points(uuid) to authenticated;
