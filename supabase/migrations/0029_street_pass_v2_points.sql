-- Street Pass claims use v2 challenge points (not legacy challenge_pass_points)

create or replace function public.v2_points_balance(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((
      select sum(c.points_awarded)
      from public.challenge_completions_v2 c
      where c.user_id = p_user_id
    ), 0)
    - coalesce((
      select sum(r.cost_points)
      from public.prize_redemptions_v2 r
      where r.user_id = p_user_id
    ), 0)
    - coalesce((
      select sum(rw.cost_points)
      from public.reward_claims rc
      join public.rewards rw on rw.id = rc.reward_id
      where rc.user_id = p_user_id
    ), 0);
$$;

revoke all on function public.v2_points_balance(uuid) from public;
grant execute on function public.v2_points_balance(uuid) to authenticated;

create or replace view public.user_points_v2 as
  select
    u.id as user_id,
    coalesce((
      select sum(c.points_awarded)
      from public.challenge_completions_v2 c
      where c.user_id = u.id
    ), 0) as points_earned,
    coalesce((
      select sum(r.cost_points)
      from public.prize_redemptions_v2 r
      where r.user_id = u.id
    ), 0)
    + coalesce((
      select sum(rw.cost_points)
      from public.reward_claims rc
      join public.rewards rw on rw.id = rc.reward_id
      where rc.user_id = u.id
    ), 0) as points_spent,
    public.v2_points_balance(u.id)::bigint as points_balance
  from auth.users u;

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
  remaining int;
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

  pts := public.v2_points_balance(uid);
  if pts < rw.cost_points then
    return jsonb_build_object(
      'ok', false,
      'error', 'not_enough_points',
      'balance', pts,
      'required', rw.cost_points
    );
  end if;

  update public.rewards
  set stock = stock - 1
  where id = rw.id and stock > 0
  returning stock into remaining;

  if remaining is null then
    return jsonb_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  insert into public.reward_claims (user_id, reward_id, voucher_code)
  values (uid, rw.id, p_voucher_code);

  return jsonb_build_object(
    'ok', true,
    'code', p_voucher_code,
    'stock_remaining', remaining,
    'balance', public.v2_points_balance(uid)
  );
end;
$$;

grant execute on function public.claim_reward(text, text) to authenticated;
