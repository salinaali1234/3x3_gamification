-- Tiered point costs (vouchers low, physical items high) + return stock after claim

UPDATE public.rewards SET cost_points = 40 WHERE slug = 'rw-merch-pack';
UPDATE public.rewards SET cost_points = 60 WHERE slug = 'rw-food-voucher';
UPDATE public.rewards SET cost_points = 180 WHERE slug = 'rw-water-bottle';
UPDATE public.rewards SET cost_points = 250 WHERE slug = 'rw-3x3-ball';

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

  pts := public.challenge_pass_points(uid);
  if pts < rw.cost_points then
    return jsonb_build_object('ok', false, 'error', 'not_enough_points');
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
    'challenge_pass_points', pts
  );
end;
$$;
