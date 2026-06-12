-- Tier 5: VIP Upgrade (6 total — Fri 1 · Sat 2 · Sun 3)
-- Note: run enum add in a separate migration/transaction before insert (Postgres requirement).

ALTER TYPE public.reward_type ADD VALUE IF NOT EXISTS 'vip_upgrade';
