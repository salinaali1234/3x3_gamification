-- 20% Unites merch store voucher (today only, in-store)

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
VALUES (
  'rw-merch-20-off',
  '20% korting Unites merch',
  '20% off Unites merch',
  '20% korting in de Unites merch store op het terrein — alleen vandaag, alleen fysiek in de winkel.',
  '20% off at the Unites merch store on site — today only, in-store redemption only.',
  'merch_voucher',
  30,
  100,
  '🏷️',
  'green'
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
