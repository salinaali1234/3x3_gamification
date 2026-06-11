-- Official Street Pass tiers (4 rewards)

INSERT INTO public.rewards (
  slug, name_nl, name_en, description_nl, description_en,
  type, cost_points, stock, emoji, accent
)
VALUES
  (
    'rw-tier-1-mix',
    'Sticker / AirPods case',
    'Sticker / AirPods case',
    'Tier 1 — kies een sticker of AirPods case (mix & match) bij de reward desk.',
    'Tier 1 — pick a sticker or AirPods case (mix & match) at the reward desk.',
    'airpods_case',
    50,
    50,
    '✨',
    'green'
  ),
  (
    'rw-tier-2-keychain',
    '3x3 keychain',
    '3x3 keychain',
    'Tier 2 — officiële 3x3 keychain bij de reward desk. Daglimiet: vrijdag 50 · zaterdag 100 · zondag 100.',
    'Tier 2 — official 3x3 keychain at the reward desk. Daily cap: Fri 50 · Sat 100 · Sun 100.',
    'merch_voucher',
    120,
    250,
    '🔑',
    'orange'
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

UPDATE public.rewards SET
  name_nl = '20% korting Unites merch',
  name_en = '20% off Unites merch',
  description_nl = 'Tier 3 — 20% korting in de Unites merch store op het terrein. Alleen vandaag, alleen fysiek in de winkel.',
  description_en = 'Tier 3 — 20% off at the Unites merch store on site. Today only, in-store redemption only.',
  cost_points = 200,
  stock = 9999,
  emoji = '🏷️',
  accent = 'blue'
WHERE slug = 'rw-merch-20-off';

UPDATE public.rewards SET
  name_nl = '3x3 bal',
  name_en = '3x3 ball',
  description_nl = 'Tier 4 — officiële 3x3 streetball bij de reward desk. Daglimiet: vrijdag 2 · zaterdag 5 · zondag 5.',
  description_en = 'Tier 4 — official 3x3 streetball at the reward desk. Daily cap: Fri 2 · Sat 5 · Sun 5.',
  cost_points = 350,
  stock = 12,
  emoji = '🏀',
  accent = 'orange'
WHERE slug = 'rw-3x3-ball';

UPDATE public.rewards SET stock = 0
WHERE slug IN (
  'rw-merch-pack',
  'rw-food-voucher',
  'rw-water-bottle',
  'rw-airpods-case',
  'rw-airpods-4'
);
