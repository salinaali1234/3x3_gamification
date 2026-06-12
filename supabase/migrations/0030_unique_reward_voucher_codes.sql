-- Globally unique Street Pass voucher codes, generated server-side per claim

create or replace function public.generate_pickup_code(p_prefix text)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  code text;
  tries int := 0;
begin
  loop
    code := p_prefix || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.wheel_spins where upper(pickup_code) = code
    ) and not exists (
      select 1 from public.reward_claims where upper(voucher_code) = code
    ) and not exists (
      select 1 from public.prize_redemptions_v2 where upper(voucher_code) = code
    );
    tries := tries + 1;
    if tries > 25 then
      raise exception 'Could not generate unique pickup code';
    end if;
  end loop;
  return code;
end;
$$;

drop index if exists public.reward_claims_voucher_code_idx;
create unique index if not exists reward_claims_voucher_code_uniq
  on public.reward_claims (upper(voucher_code));

create or replace function public.claim_reward(p_slug text, p_voucher_code text default null)
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
  v_code text;
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

  v_code := public.generate_pickup_code('PASS');

  update public.rewards
  set stock = stock - 1
  where id = rw.id and stock > 0
  returning stock into remaining;

  if remaining is null then
    return jsonb_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  insert into public.reward_claims (user_id, reward_id, voucher_code)
  values (uid, rw.id, v_code);

  return jsonb_build_object(
    'ok', true,
    'code', v_code,
    'stock_remaining', remaining,
    'balance', public.v2_points_balance(uid)
  );
end;
$$;

grant execute on function public.claim_reward(text, text) to authenticated;
