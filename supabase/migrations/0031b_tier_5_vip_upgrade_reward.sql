-- Tier 5 reward row (requires 0031 enum value committed first)

INSERT INTO public.rewards (
  slug, name_nl, name_en, description_nl, description_en,
  type, cost_points, stock, emoji, accent
)
VALUES (
  'rw-tier-5-vip',
  'VIP Upgrade',
  'VIP Upgrade',
  'Tier 5 — VIP upgrade bij de reward desk. Daglimiet: vrijdag 1 · zaterdag 2 · zondag 3.',
  'Tier 5 — VIP upgrade at the reward desk. Daily cap: Fri 1 · Sat 2 · Sun 3.',
  'vip_upgrade',
  500,
  6,
  '⭐',
  'blue'
)
ON CONFLICT (slug) DO UPDATE SET
  name_nl = EXCLUDED.name_nl,
  name_en = EXCLUDED.name_en,
  description_nl = EXCLUDED.description_nl,
  description_en = EXCLUDED.description_en,
  type = EXCLUDED.type,
  cost_points = EXCLUDED.cost_points,
  stock = EXCLUDED.stock,
  emoji = EXCLUDED.emoji,
  accent = EXCLUDED.accent;
