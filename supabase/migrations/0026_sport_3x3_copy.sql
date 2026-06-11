-- Sport copy uses lowercase x (3x3 Street League, ball, clinic, etc.)

UPDATE public.rewards SET
  name_nl = '3x3 keychain',
  name_en = '3x3 keychain',
  description_nl = 'Tier 2 — officiële 3x3 keychain bij de reward desk. Daglimiet: vrijdag 50 · zaterdag 100 · zondag 100.',
  description_en = 'Tier 2 — official 3x3 keychain at the reward desk. Daily cap: Fri 50 · Sat 100 · Sun 100.'
WHERE slug = 'rw-tier-2-keychain';

UPDATE public.rewards SET
  name_nl = '3x3 bal',
  name_en = '3x3 ball',
  description_nl = 'Tier 4 — officiële 3x3 streetball bij de reward desk. Daglimiet: vrijdag 2 · zaterdag 5 · zondag 5.',
  description_en = 'Tier 4 — official 3x3 streetball at the reward desk. Daily cap: Fri 2 · Sat 5 · Sun 5.'
WHERE slug = 'rw-3x3-ball';
