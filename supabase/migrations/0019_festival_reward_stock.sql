-- Actual festival stock counts (2026 Street Pass prizes)

UPDATE public.rewards SET stock = 50 WHERE slug = 'rw-merch-pack';
UPDATE public.rewards SET stock = 40 WHERE slug = 'rw-food-voucher';
UPDATE public.rewards SET stock = 20 WHERE slug = 'rw-water-bottle';
UPDATE public.rewards SET stock = 6 WHERE slug = 'rw-3x3-ball';
