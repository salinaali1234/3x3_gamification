-- Retire AirPods 4 reward (cases only in catalog)

UPDATE public.rewards
SET stock = 0
WHERE slug = 'rw-airpods-4';
