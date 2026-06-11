-- User-facing copy: 3X3 branding (Unites, Leader, Court, Street League, etc.)

UPDATE public.rewards SET
  name_nl = '3X3 keychain',
  name_en = '3X3 keychain',
  description_nl = 'Tier 2 — officiële 3X3 keychain bij de reward desk. Daglimiet: vrijdag 50 · zaterdag 100 · zondag 100.',
  description_en = 'Tier 2 — official 3X3 keychain at the reward desk. Daily cap: Fri 50 · Sat 100 · Sun 100.'
WHERE slug = 'rw-tier-2-keychain';

UPDATE public.rewards SET
  name_nl = '3X3 bal',
  name_en = '3X3 ball',
  description_nl = 'Tier 4 — officiële 3X3 streetball bij de reward desk. Daglimiet: vrijdag 2 · zaterdag 5 · zondag 5.',
  description_en = 'Tier 4 — official 3X3 streetball at the reward desk. Daily cap: Fri 2 · Sat 5 · Sun 5.'
WHERE slug = 'rw-3x3-ball';

-- challenges_v2 (when present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'challenges_v2' AND column_name = 'subtitle'
  ) THEN
    UPDATE public.challenges_v2 SET
      subtitle = replace(subtitle, '3x3', '3X3'),
      description = replace(description, '3x3', '3X3')
    WHERE subtitle LIKE '%3x3%' OR description LIKE '%3x3%';
  END IF;
END $$;
