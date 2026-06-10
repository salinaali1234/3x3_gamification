import { listBadges } from "@/lib/data/store";
import type { LeaderboardRow } from "@/lib/data/store";
import { createSupabaseServerClient } from "./server";

type DbLeaderboardRow = {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_color: string;
  points: number;
  steps_done: number;
  badge_codes: string[] | null;
};

function badgeIdsFromCodes(codes: string[]): string[] {
  const byCode = new Map(listBadges().map((b) => [b.code, b.id]));
  return codes.map((code) => byCode.get(code)).filter(Boolean) as string[];
}

export async function getLeaderboardDb(limit = 100): Promise<LeaderboardRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_limit: limit,
  });

  if (error || !data) return [];

  return (data as DbLeaderboardRow[]).map((row) => ({
    rank: Number(row.rank),
    userId: row.user_id,
    displayName: row.display_name,
    avatarColor: row.avatar_color,
    points: row.points,
    stepsDone: Number(row.steps_done),
    badgeIds: badgeIdsFromCodes(row.badge_codes ?? []),
  }));
}
