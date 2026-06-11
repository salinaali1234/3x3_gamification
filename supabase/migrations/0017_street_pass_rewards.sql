-- Street Pass reward catalog (2026 festival prizes)

INSERT INTO public.rewards (
  slug,
  name_nl,
  name_en,
  description_nl,
  description_en,
  type,
  cost_points,
  stock,
  emoji,
  accent
)
VALUES
  (
    'rw-merch-pack',
    'Merch voucher',
    'Merch voucher',
    'Keychain, armband of sticker — kies bij de reward desk.',
    'Keychain, bracelet or sticker — pick one at the reward desk.',
    'merch_voucher',
    100,
    120,
    '🎁',
    'orange'
  ),
  (
    'rw-food-voucher',
    'Food voucher',
    'Food voucher',
    'Maaltijd bij de food trucks. Vraag op locatie naar de vrienden-loterij.',
    'Meal at the food trucks. Ask on site about the friends lottery.',
    'food',
    200,
    60,
    '🍔',
    'green'
  ),
  (
    'rw-water-bottle',
    '3x3 waterfles',
    '3x3 water bottle',
    'Officiële 3x3 Unites waterfles — ophalen bij de reward desk.',
    'Official 3x3 Unites water bottle — collect at the reward desk.',
    'water',
    350,
    80,
    '💧',
    'blue'
  ),
  (
    'rw-3x3-ball',
    '3x3 bal',
    '3x3 ball',
    'Officiële 3x3 streetball — ophalen bij de reward desk.',
    'Official 3x3 streetball — collect at the reward desk.',
    'ball',
    500,
    50,
    '🏀',
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

-- Hide retired catalog items (keep rows for existing claims)
UPDATE public.rewards
SET stock = 0
WHERE slug IN (
  'rw-food',
  'rw-water',
  'rw-merch',
  'rw-autograph',
  'rw-speaker'
);
