-- Premium physical rewards: AirPods 4 + AirPods cases
-- Enum values must be committed before use (see 0021a).

-- 0021a_reward_type_airpods.sql
ALTER TYPE public.reward_type ADD VALUE IF NOT EXISTS 'airpods';
ALTER TYPE public.reward_type ADD VALUE IF NOT EXISTS 'airpods_case';
