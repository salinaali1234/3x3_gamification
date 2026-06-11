-- Mark-as-done (manual) challenges: uniform 50 points

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'challenges_v2'
  ) THEN
    UPDATE public.challenges_v2 SET points = 50 WHERE verification = 'manual';
  END IF;
END $$;
