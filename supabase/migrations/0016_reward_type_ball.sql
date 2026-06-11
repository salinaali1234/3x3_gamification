-- Add reward_type value (must run before using it in inserts)

ALTER TYPE public.reward_type ADD VALUE IF NOT EXISTS 'ball';
