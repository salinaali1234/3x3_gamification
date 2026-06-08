import type {
  Bilingual,
  FestivalDay,
  LiveMatch,
  ScheduleItem,
  ScheduleItemKind,
  ScheduleSession,
} from "./types";

const STADIUM = { nl: "In het stadion", en: "In the stadium" } satisfies Bilingual;

function s(
  id: string,
  day: FestivalDay,
  number: number,
  tagline?: Bilingual
): ScheduleSession {
  return {
    id,
    day,
    number,
    title: { nl: `Sessie ${number}`, en: `Session ${number}` },
    location: STADIUM,
    tagline,
  };
}

function i(
  sessionId: string,
  startTime: string,
  title: Bilingual,
  kind: ScheduleItemKind,
  court?: string
): ScheduleItem {
  return {
    id: `${sessionId}-${startTime.replace(":", "")}`,
    sessionId,
    startTime,
    title,
    kind,
    court,
  };
}

export const SEED_SCHEDULE_SESSIONS: ScheduleSession[] = [
  s("sess-1", "friday", 1),
  s("sess-2", "saturday", 2),
  s("sess-3", "saturday", 3),
  s("sess-4", "sunday", 4, {
    nl: "Beleef de finales van de FIBA 3x3 World Tour Masters & Women's Series live!",
    en: "Experience the FIBA 3x3 World Tour Masters & Women's Series finals live!",
  }),
  s("sess-5", "sunday", 5),
];

export const SEED_SCHEDULE_ITEMS: ScheduleItem[] = [
  // Sessie 1 — Vrijdag 19 juni
  i("sess-1", "17:30", { nl: "Deuren open", en: "Doors open" }, "doors"),
  i("sess-1", "18:00", { nl: "Wenen - Colloseum", en: "Vienna - Colosseum" }, "match", "qd1"),
  i("sess-1", "18:25", { nl: "Basketball Bonns - Quest #1", en: "Basketball Bonns - Quest #1" }, "match", "qd2"),
  i("sess-1", "18:50", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-1", "19:00", { nl: "Ermont SENEF - Colloseum", en: "Ermont SENEF - Colosseum" }, "match", "qd1"),
  i("sess-1", "19:25", { nl: "Bucharest - Quest #1", en: "Bucharest - Quest #1" }, "match", "qd2"),
  i("sess-1", "19:50", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-1", "20:00", { nl: "Vienna - Ermont SENEF", en: "Vienna - Ermont SENEF" }, "match", "qd1"),
  i("sess-1", "20:25", { nl: "Basketball Bonns - Bucharest", en: "Basketball Bonns - Bucharest" }, "match", "qd2"),
  i("sess-1", "20:50", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-1", "21:05", { nl: "Rapid Bucharest - Portugal", en: "Rapid Bucharest - Portugal" }, "match"),
  i("sess-1", "21:30", { nl: "Beijing - Belgium", en: "Beijing - Belgium" }, "match"),
  i("sess-1", "21:55", { nl: "Italy - Qualifier #1", en: "Italy - Qualifier #1" }, "match"),
  i("sess-1", "22:20", { nl: "Half time show", en: "Half time show" }, "show"),
  i("sess-1", "22:40", { nl: "Nederland - Croatia", en: "Netherlands - Croatia" }, "match"),
  i("sess-1", "23:05", { nl: "Einde Sessie 1", en: "End of Session 1" }, "end"),

  // Sessie 2 — Zaterdag 20 juni
  i("sess-2", "10:30", { nl: "Deuren open", en: "Doors open" }, "doors"),
  i("sess-2", "10:50", { nl: "Ub - Praia Clube", en: "Ub - Praia Clube" }, "match"),
  i("sess-2", "11:15", { nl: "Miami - Rome", en: "Miami - Rome" }, "match"),
  i("sess-2", "11:50", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-2", "12:10", { nl: "Skyliners - QD A/I", en: "Skyliners - QD A/I" }, "match"),
  i("sess-2", "12:35", { nl: "Amsterdam RABOBANK - QD B/I", en: "Amsterdam RABOBANK - QD B/I" }, "match"),
  i("sess-2", "13:00", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-2", "13:10", { nl: "Phoenix - Praia Clube", en: "Phoenix - Praia Clube" }, "match"),
  i("sess-2", "13:35", { nl: "DeQing - Rome", en: "DeQing - Rome" }, "match"),
  i("sess-2", "14:00", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-2", "14:15", { nl: "Kenya - Croatia", en: "Kenya - Croatia" }, "match"),
  i("sess-2", "14:40", { nl: "Mitsubishi Electric - Portugal", en: "Mitsubishi Electric - Portugal" }, "match"),
  i("sess-2", "15:05", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-2", "15:15", { nl: "Ireland - Belgium", en: "Ireland - Belgium" }, "match"),
  i("sess-2", "15:40", { nl: "Romania - WS Qualifier #1", en: "Romania - WS Qualifier #1" }, "match"),
  i("sess-2", "16:05", { nl: "Einde Sessie 2", en: "End of Session 2" }, "end"),

  // Sessie 3 — Zaterdag 20 juni
  i("sess-3", "17:15", { nl: "Deuren open", en: "Doors open" }, "doors"),
  i("sess-3", "17:45", { nl: "Nederland - Kenya", en: "Netherlands - Kenya" }, "match"),
  i("sess-3", "18:10", { nl: "Rapid Bucharest - Mitsubishi Electric", en: "Rapid Bucharest - Mitsubishi Electric" }, "match"),
  i("sess-3", "18:35", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-3", "18:45", { nl: "Beijing - Ireland", en: "Beijing - Ireland" }, "match"),
  i("sess-3", "19:10", { nl: "Italy - Romania", en: "Italy - Romania" }, "match"),
  i("sess-3", "19:35", { nl: "Break", en: "Break" }, "break"),
  i("sess-3", "20:00", { nl: "Toulouse - QD A/I", en: "Toulouse - QD A/I" }, "match"),
  i("sess-3", "20:25", { nl: "Shanghai - QD B/I", en: "Shanghai - QD B/I" }, "match"),
  i("sess-3", "20:50", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-3", "21:00", { nl: "Ub - Phoenix", en: "Ub - Phoenix" }, "match"),
  i("sess-3", "21:25", { nl: "Miami - DeQing", en: "Miami - DeQing" }, "match"),
  i("sess-3", "21:50", { nl: "Skyliners - Toulouse", en: "Skyliners - Toulouse" }, "match"),
  i("sess-3", "22:20", { nl: "Half time show", en: "Half time show" }, "show"),
  i("sess-3", "22:35", { nl: "Amsterdam RABOBANK - Shanghai", en: "Amsterdam RABOBANK - Shanghai" }, "match"),
  i("sess-3", "23:05", { nl: "Einde Sessie 3", en: "End of Session 3" }, "end"),

  // Sessie 4 — Zondag 21 juni
  i("sess-4", "10:15", { nl: "Deuren open", en: "Doors open" }, "doors"),
  i("sess-4", "10:45", { nl: "Women's Series Kwartfinale Game 1", en: "Women's Series Quarterfinal Game 1" }, "match"),
  i("sess-4", "11:10", { nl: "Women's Series Kwartfinale Game 2", en: "Women's Series Quarterfinal Game 2" }, "match"),
  i("sess-4", "11:35", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-4", "11:45", { nl: "Women's Series Kwartfinale Game 3", en: "Women's Series Quarterfinal Game 3" }, "match"),
  i("sess-4", "12:10", { nl: "Women's Series Kwartfinale Game 4", en: "Women's Series Quarterfinal Game 4" }, "match"),
  i("sess-4", "12:35", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-4", "12:50", { nl: "World Tour Kwartfinale Game 1", en: "World Tour Quarterfinal Game 1" }, "match"),
  i("sess-4", "13:20", { nl: "World Tour Kwartfinale Game 2", en: "World Tour Quarterfinal Game 2" }, "match"),
  i("sess-4", "13:50", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-4", "14:00", { nl: "World Tour Kwartfinale Game 3", en: "World Tour Quarterfinal Game 3" }, "match"),
  i("sess-4", "14:30", { nl: "World Tour Kwartfinale Game 4", en: "World Tour Quarterfinal Game 4" }, "match"),
  i("sess-4", "15:00", { nl: "Shoot Out Finale", en: "Shoot Out Final" }, "show"),
  i("sess-4", "15:20", { nl: "Einde Sessie 4", en: "End of Session 4" }, "end"),

  // Sessie 5 — Zondag 21 juni
  i("sess-5", "16:00", { nl: "Deuren open", en: "Doors open" }, "doors"),
  i("sess-5", "16:15", { nl: "Women's Series Halve Finale Game 1", en: "Women's Series Semifinal Game 1" }, "match"),
  i("sess-5", "16:40", { nl: "Women's Series Halve Finale Game 2", en: "Women's Series Semifinal Game 2" }, "match"),
  i("sess-5", "17:05", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-5", "17:35", { nl: "Women's Series Finale", en: "Women's Series Final" }, "match"),
  i("sess-5", "18:00", { nl: "Prijsuitreiking", en: "Award ceremony" }, "ceremony"),
  i("sess-5", "18:15", { nl: "Break Entertainment", en: "Break Entertainment" }, "break"),
  i("sess-5", "18:30", { nl: "World Tour Halve Finale Game 1", en: "World Tour Semifinal Game 1" }, "match"),
  i("sess-5", "19:00", { nl: "World Tour Halve Finale Game 2", en: "World Tour Semifinal Game 2" }, "match"),
  i("sess-5", "19:30", { nl: "Dunk Contest", en: "Dunk Contest" }, "show"),
  i("sess-5", "20:00", { nl: "World Tour Finale", en: "World Tour Final" }, "match"),
  i("sess-5", "20:30", { nl: "Prijsuitreiking", en: "Award ceremony" }, "ceremony"),
  i("sess-5", "20:45", { nl: "Einde Sessie 5", en: "End of Session 5" }, "end"),
];

/** Live matches for score gamification — team vs team games from the stadium schedule. */
export const SEED_LIVE_MATCHES: LiveMatch[] = SEED_SCHEDULE_ITEMS.filter(
  (item) => item.kind === "match" && item.title.nl.includes(" - ")
).map((item) => {
  const session = SEED_SCHEDULE_SESSIONS.find((s) => s.id === item.sessionId)!;
  const [teamA, teamB] = item.title.nl.split(" - ").map((s) => s.trim());
  return {
    id: item.id,
    day: session.day,
    startTime: item.startTime,
    label: item.title,
    teamA,
    teamB,
    finalScore: null,
  };
});
