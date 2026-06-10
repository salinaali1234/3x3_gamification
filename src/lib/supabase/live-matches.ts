import type { LiveMatch } from "@/lib/data/types";
import { createSupabaseServerClient } from "./server";

type DbLiveMatchRow = {
  id: string;
  day: LiveMatch["day"];
  start_time: string;
  label_nl: string;
  label_en: string;
  team_a: string;
  team_b: string;
  final_score: string | null;
};

function mapLiveMatch(row: DbLiveMatchRow): LiveMatch {
  return {
    id: row.id,
    day: row.day,
    startTime: row.start_time,
    label: { nl: row.label_nl, en: row.label_en },
    teamA: row.team_a,
    teamB: row.team_b,
    finalScore: row.final_score,
  };
}

export async function listLiveMatchesDb(): Promise<LiveMatch[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("live_matches")
    .select("id, day, start_time, label_nl, label_en, team_a, team_b, final_score")
    .order("day")
    .order("start_time");

  if (error || !data) return [];
  return (data as DbLiveMatchRow[]).map(mapLiveMatch);
}

export async function getLiveMatchByIdDb(id: string): Promise<LiveMatch | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("live_matches")
    .select("id, day, start_time, label_nl, label_en, team_a, team_b, final_score")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapLiveMatch(data as DbLiveMatchRow);
}

export async function setLiveMatchFinalScoreDb(matchId: string, finalScore: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false as const, error: "db_error" };

  const { data, error } = await supabase.rpc("set_live_match_final_score", {
    p_match_id: matchId,
    p_final_score: finalScore,
  });

  if (error) return { ok: false as const, error: error.message };
  return data as { ok: boolean; error?: string; match_id?: string; final_score?: string | null };
}
