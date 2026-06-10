-- Prize pickup codes + staff redemption audit trail (wheel + Challenge Pass rewards)

alter table public.wheel_spins
  add column if not exists pickup_code text,
  add column if not exists redeemed_at timestamptz,
  add column if not exists redeemed_by uuid references public.profiles(id);

alter table public.reward_claims
  add column if not exists redeemed_at timestamptz,
  add column if not exists redeemed_by uuid references public.profiles(id);

create unique index if not exists wheel_spins_pickup_code_idx
  on public.wheel_spins (pickup_code)
  where pickup_code is not null;

create index if not exists reward_claims_voucher_code_idx
  on public.reward_claims (voucher_code);

-- Backfill pickup codes for existing spins
do $$
declare
  spin record;
  code text;
  tries int;
begin
  for spin in select id from public.wheel_spins where pickup_code is null loop
    tries := 0;
    loop
      code := 'WHEEL-' || upper(substr(replace(extensions.uuid_generate_v4()::text, '-', ''), 1, 6));
      exit when not exists (select 1 from public.wheel_spins where pickup_code = code);
      tries := tries + 1;
      if tries > 20 then
        raise exception 'Could not generate unique pickup code for spin %', spin.id;
      end if;
    end loop;
    update public.wheel_spins set pickup_code = code where id = spin.id;
  end loop;
end;
$$;

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
    code := p_prefix || '-' || upper(substr(replace(extensions.uuid_generate_v4()::text, '-', ''), 1, 6));
    if p_prefix = 'WHEEL' then
      exit when not exists (select 1 from public.wheel_spins where pickup_code = code);
    else
      exit when not exists (
        select 1 from public.reward_claims where upper(voucher_code) = code
      );
    end if;
    tries := tries + 1;
    if tries > 25 then
      raise exception 'Could not generate unique pickup code';
    end if;
  end loop;
  return code;
end;
$$;

create or replace function public.spin_wheel()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  earned_spins int;
  used_spins int;
  available int;
  prize record;
  r float;
  acc float := 0;
  total_weight float;
  spin_id uuid;
  pickup text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_logged_in');
  end if;

  earned_spins := public.wheel_spins_earned(uid);
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
  pickup := public.generate_pickup_code('WHEEL');

  for prize in
    select *
    from public.wheel_prizes
    where unlimited or stock > 0
    order by id
  loop
    acc := acc + prize.weight;
    if r <= acc then
      insert into public.wheel_spins (user_id, prize_id, pickup_code)
      values (uid, prize.id, pickup)
      returning id into spin_id;

      if not prize.unlimited and prize.stock > 0 then
        update public.wheel_prizes
        set stock = stock - 1
        where id = prize.id and stock > 0;
      end if;

      earned_spins := public.wheel_spins_earned(uid);
      used_spins := (select count(*)::int from public.wheel_spins where user_id = uid);

      return jsonb_build_object(
        'ok', true,
        'spin_id', spin_id,
        'pickup_code', pickup,
        'prize', jsonb_build_object(
          'id', prize.id,
          'emoji', prize.emoji,
          'label_nl', prize.label_nl,
          'label_en', prize.label_en
        ),
        'spins_remaining', earned_spins - used_spins,
        'spins_earned', earned_spins
      );
    end if;
  end loop;

  return jsonb_build_object('ok', false, 'error', 'no_prizes');
end;
$$;

create or replace function public.lookup_prize_code(p_query text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  q text := upper(trim(p_query));
  reward_rows jsonb := '[]'::jsonb;
  wheel_rows jsonb := '[]'::jsonb;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'not_admin');
  end if;

  if q = '' then
    return jsonb_build_object('ok', false, 'error', 'empty_query');
  end if;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) into reward_rows
  from (
    select
      rc.id,
      'reward'::text as kind,
      rc.voucher_code as code,
      rc.claimed_at,
      rc.redeemed_at,
      redeemer.display_name as redeemed_by_name,
      p.id as user_id,
      p.email,
      p.display_name,
      rw.slug as reward_slug,
      rw.emoji,
      rw.name_nl,
      rw.name_en
    from public.reward_claims rc
    join public.profiles p on p.id = rc.user_id
    join public.rewards rw on rw.id = rc.reward_id
    left join public.profiles redeemer on redeemer.id = rc.redeemed_by
    where upper(rc.voucher_code) = q
       or p.email ilike '%' || trim(p_query) || '%'
       or p.display_name ilike '%' || trim(p_query) || '%'
    order by rc.claimed_at desc
    limit 50
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) into wheel_rows
  from (
    select
      ws.id,
      'wheel'::text as kind,
      ws.pickup_code as code,
      ws.created_at as claimed_at,
      ws.redeemed_at,
      redeemer.display_name as redeemed_by_name,
      p.id as user_id,
      p.email,
      p.display_name,
      wp.id as prize_id,
      wp.emoji,
      wp.label_nl,
      wp.label_en
    from public.wheel_spins ws
    join public.profiles p on p.id = ws.user_id
    join public.wheel_prizes wp on wp.id = ws.prize_id
    left join public.profiles redeemer on redeemer.id = ws.redeemed_by
    where upper(ws.pickup_code) = q
       or p.email ilike '%' || trim(p_query) || '%'
       or p.display_name ilike '%' || trim(p_query) || '%'
    order by ws.created_at desc
    limit 50
  ) t;

  return jsonb_build_object(
    'ok', true,
    'query', p_query,
    'reward_claims', reward_rows,
    'wheel_spins', wheel_rows
  );
end;
$$;

create or replace function public.mark_reward_redeemed(p_voucher_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  claim record;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'not_admin');
  end if;

  select * into claim
  from public.reward_claims
  where upper(voucher_code) = upper(trim(p_voucher_code))
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if claim.redeemed_at is not null then
    return jsonb_build_object(
      'ok', false,
      'error', 'already_redeemed',
      'redeemed_at', claim.redeemed_at
    );
  end if;

  update public.reward_claims
  set redeemed_at = now(), redeemed_by = auth.uid()
  where id = claim.id;

  return jsonb_build_object('ok', true, 'redeemed_at', now());
end;
$$;

create or replace function public.mark_wheel_redeemed(p_pickup_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  spin record;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'not_admin');
  end if;

  select * into spin
  from public.wheel_spins
  where upper(pickup_code) = upper(trim(p_pickup_code))
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if spin.redeemed_at is not null then
    return jsonb_build_object(
      'ok', false,
      'error', 'already_redeemed',
      'redeemed_at', spin.redeemed_at
    );
  end if;

  update public.wheel_spins
  set redeemed_at = now(), redeemed_by = auth.uid()
  where id = spin.id;

  return jsonb_build_object('ok', true, 'redeemed_at', now());
end;
$$;

revoke execute on function public.lookup_prize_code(text) from public;
revoke execute on function public.mark_reward_redeemed(text) from public;
revoke execute on function public.mark_wheel_redeemed(text) from public;
revoke execute on function public.generate_pickup_code(text) from public;

grant execute on function public.lookup_prize_code(text) to authenticated;
grant execute on function public.mark_reward_redeemed(text) to authenticated;
grant execute on function public.mark_wheel_redeemed(text) to authenticated;
