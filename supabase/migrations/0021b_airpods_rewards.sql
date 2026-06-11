-- Insert AirPods rewards (run after 0021a)

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
    'rw-airpods-case',
    'AirPods case',
    'AirPods case',
    'Case voor AirPods (4e gen.) — ophalen bij de reward desk.',
    'AirPods case (4th gen.) — collect at the reward desk.',
    'airpods_case',
    300,
    12,
    '🎧',
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
