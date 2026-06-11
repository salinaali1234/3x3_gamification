/**
 * Unified challenges + prize tiers (replaces journey, wheel, side challenges, rewards).
 *
 * Mock-only for now. When Supabase migration 0015 is applied, swap reads
 * to challenges_v2 / prize_tiers / *_v2 RPCs (see src/lib/supabase/challenges-v2.ts).
 */

export type ChallengeAccent = "green" | "orange" | "blue";
export type ChallengeVerification = "code" | "manual" | "photo" | "fence";
export type DayFlag = "friday" | "saturday";

export type UnifiedChallenge = {
  id: string;
  location: string;
  sortOrder: number;
  /** Short headline on challenge cards. */
  title: string;
  /** Former long title — shown under the headline. */
  subtitle: string;
  description: string;
  points: number;
  verification: ChallengeVerification;
  /** Required when verification === "code". */
  code?: string;
  /** Required when verification === "fence" — full ordered solution. */
  letters?: string[];
  dayFlag?: DayFlag;
  accent: ChallengeAccent;
};

export type PrizeTier = {
  id: string;
  sortOrder: number;
  name: string;
  description: string;
  costPoints: number;
  /** -1 = unlimited */
  stock: number;
  emoji: string;
  accent: ChallengeAccent;
};

export type ChallengeCompletion = {
  userId: string;
  challengeId: string;
  pointsAwarded: number;
  completedAt: string;
};

export type PrizeRedemption = {
  id: string;
  userId: string;
  tierId: string;
  costPoints: number;
  voucherCode: string;
  claimedAt: string;
  redeemedAt: string | null;
};

// ---------- Seed: 23 unified challenges ----------

export const UNIFIED_CHALLENGES: UnifiedChallenge[] = [
  // 3X3 Unites Area
  { id: "skills-showdown",        location: "3X3 Unites Area",     sortOrder: 10, title: "Skills Showdown",        subtitle: "Discover your 3x3 player abilities at the Skills Showdown", description: "Test your shooting, dribbling and reaction skills at the Skills Showdown. Get your code from the leader at the booth.", points: 75,  verification: "code",   code: "SKILLS-2026",   accent: "green" },
  { id: "leaderhub-clinic",       location: "3X3 Unites Area",     sortOrder: 20, title: "LeaderHub Clinic",       subtitle: "Sign up at the LeaderHub for a 3x3 clinic or trial leader course", description: "Join a clinic or sign up as a trial 3x3 leader at the LeaderHub. Leaders give you a unique code on completion.", points: 200, verification: "code",   code: "LEADER-200",    accent: "green" },
  { id: "learn-about-leaders",    location: "3X3 Unites Area",     sortOrder: 30, title: "Meet Our Leaders",       subtitle: "Learn more about 3X3 Unites from our Leaders at the LeaderHub", description: "Stop by the LeaderHub, hear the story behind our leader program and grab the code.", points: 75,  verification: "code",   code: "HUB-LEARN",     accent: "green" },

  // Kids Area
  { id: "shon-price-live-art",    location: "Kids Area",           sortOrder: 10, title: "Live Art",               subtitle: "Help Shon Price paint his live art piece at the Kids Area", description: "Pick up a brush and contribute to the live art piece — mark it done when you've helped.", points: 50,  verification: "manual", accent: "orange" },
  { id: "godrip-cornhole",        location: "Kids Area",           sortOrder: 20, title: "GoDrip Challenge",       subtitle: "Challenge GoDrip in cornhole or bucket shooting at the Kids Area", description: "Take on GoDrip in a quick game — bucket shooting or cornhole. Mark it done when finished.", points: 50,  verification: "manual", accent: "orange" },

  // Community Corner
  { id: "vriendenloterij-trivia", location: "Community Corner",    sortOrder: 10, title: "Sports Trivia",          subtitle: "Play sports trivia at the VriendenLoterij locker rooms", description: "Test your sports knowledge at the VriendenLoterij locker rooms.", points: 50,  verification: "manual", accent: "blue" },
  { id: "sneakerness-shoelacing", location: "Community Corner",    sortOrder: 20, title: "Shoelacing Challenge",   subtitle: "Attempt the Sneakerness shoelacing challenge under the tarp", description: "Lace your sneakers fast and clean under the tarp at the Community Corner. Code from the leader.", points: 100, verification: "code",   code: "LACE-100",      accent: "blue" },
  { id: "triple-threat-barber",   location: "Community Corner",    sortOrder: 30, title: "Triple Threat Barber",   subtitle: "Freshen up your haircut at the Triple Threat BarberShop", description: "Get a quick fade or trim at the Triple Threat BarberShop, then enter the leader code.", points: 100, verification: "code",   code: "FADE-100",      accent: "blue" },
  { id: "talent-movement-music",  location: "Community Corner",    sortOrder: 40, title: "Talent Movement",        subtitle: "Groove and make music at the Talent Movement van", description: "Stop by the Talent Movement van, jam along and mark it done.", points: 50,  verification: "manual", accent: "blue" },

  // The Streets
  { id: "street-league-watch",    location: "The Streets",         sortOrder: 10, title: "Street League",          subtitle: "Dive into The Streets and watch a Street League game", description: "Find a spot at The Streets and watch a full Street League game. Code from the leader at the court.", points: 200, verification: "code",   code: "STREET-200",    accent: "green" },
  { id: "kfc-court-hangout",      location: "The Streets",         sortOrder: 20, title: "KFC Court",              subtitle: "Hangout and play some challenges on the KFC court", description: "Spend time at the KFC court, join a casual game and mark it done.", points: 25,  verification: "manual", accent: "green" },

  // Warm-Up Court
  { id: "dunking-devils-show",    location: "Warm-Up Court",       sortOrder: 10, title: "Dunking Devils",         subtitle: "Watch the craziest flips and dunks from the Dunking Devils show in front of the stadium", description: "Catch the Dunking Devils performing in front of the stadium.", points: 75,  verification: "manual", accent: "orange" },
  { id: "pro-warmup-watch",       location: "Warm-Up Court",       sortOrder: 20, title: "Pro Warm-Up",            subtitle: "Watch the 3x3 professionals get ready for their World Tour / Women's Series match", description: "Watch the pros prepare at the Warm-Up Court before they hit the main stage.", points: 25, verification: "manual", accent: "orange" },

  // Panna Courts
  { id: "panna-ko-watch",         location: "Panna Courts",        sortOrder: 10, title: "Panna KO",               subtitle: "Watch the intensity and flare of Panna KO street ballers at the panna cages", description: "Catch the Panna KO street ballers at the panna cages.", points: 75,  verification: "manual", accent: "blue" },
  { id: "breakdance-battles",     location: "Panna Courts",        sortOrder: 20, title: "Break Dance Battles",    subtitle: "Experience the energy and vibes from the Break Dance Battles at the panna cages", description: "Catch the Break Dance Battles at the panna cages.", points: 25,  verification: "manual", dayFlag: "saturday", accent: "blue" },

  // Side Events Court
  { id: "one-vs-one-leaders",     location: "Side Events Court",   sortOrder: 10, title: "1v1 vs Leaders",         subtitle: "Take part on the 1v1 challenge versus 3x3 Unites leaders from all over the country", description: "Sign up for a 1v1 versus a 3x3 Unites leader. Leader hands out the code after your match.", points: 75,  verification: "code",   code: "ONE-V-ONE", accent: "green" },
  { id: "nbb-clinic",             location: "Side Events Court",   sortOrder: 20, title: "NBB Clinic",               subtitle: "Join in on the 3x3 basketball clinic given by the Nederlandse Basketball Bond (NBB)", description: "Join the NBB clinic at the side events court.", points: 50, verification: "manual", dayFlag: "friday", accent: "green" },
  { id: "shootout-challenge",     location: "Side Events Court",   sortOrder: 30, title: "Shootout",               subtitle: "Take part in the Shootout challenge at the side events court", description: "Take three shots from the line. Code from the leader.", points: 100, verification: "code", code: "SHOOT-100", accent: "green" },
  { id: "meet-greet-teams",       location: "Side Events Court",   sortOrder: 40, title: "Meet & Greet",           subtitle: "Meet & Greet the 3x3 professional mens and womens basketball team", description: "Get a photo or autograph with the pro teams. Mark it done.", points: 25, verification: "manual", accent: "green" },
  { id: "rabobank-arcade",        location: "Side Events Court",   sortOrder: 50, title: "Rabobank Arcade",        subtitle: "Challenge a leader to play the Rabobank basketball arcade game in front of De Waaier", description: "Beat (or be beaten by) a leader on the Rabobank arcade game. Leader gives the code.", points: 50, verification: "code", code: "WAAIER-50", accent: "orange" },

  // Interactive Dome
  { id: "leader-conversations",   location: "Interactive Dome",    sortOrder: 10, title: "Leader Talks",           subtitle: "Tune in to conversations about 3X3 Unites and the achieved impact over the last 10 years", description: "Listen to the leaders talk impact at the Interactive Dome.", points: 100, verification: "code", code: "DOME-100", accent: "blue" },
  { id: "dome-immersive-video",   location: "Interactive Dome",    sortOrder: 20, title: "Immersive Video",        subtitle: "Experience the first ever 3x3 basketball immersive video experience at the dome", description: "Step into the immersive video experience — pick up the code on your way out.", points: 200, verification: "code", code: "DOME-IMMERSIVE", accent: "blue" },
  { id: "odido-arcade-outside",   location: "Interactive Dome",    sortOrder: 30, title: "ODIDO Arcade",           subtitle: "Try out the ODIDO basketball arcade outside the Interactive Dome", description: "Try the ODIDO arcade outside the dome and mark it done.", points: 25, verification: "manual", accent: "blue" },

  // Fence Installations (special multi-letter)
  { id: "fence-leaders", location: "Fence Installations", sortOrder: 10,
    title: "Fence Leaders",
    subtitle: "Meet all 10 fence leaders in real life for a special reward",
    description: "The leaders on the fences are here on the grounds! Meet all 10 in real life — each one gives you one letter. Enter all 10 letters in the correct order on this challenge to form the secret word and claim 333 points.",
    points: 333, verification: "fence",
    letters: ["S","T","R","E","E","T","G","A","M","E"],
    accent: "orange" },
];

// ---------- Seed: placeholder prize tiers ----------

export const PRIZE_TIERS: PrizeTier[] = [
  { id: "tier-bronze",   sortOrder: 10, name: "Bronze Reward",   description: "Placeholder — first reachable prize tier. Details TBD.",    costPoints: 250,  stock: -1, emoji: "🥉", accent: "orange" },
  { id: "tier-silver",   sortOrder: 20, name: "Silver Reward",   description: "Placeholder — mid-tier prize. Details TBD.",                costPoints: 600,  stock: -1, emoji: "🥈", accent: "blue"   },
  { id: "tier-gold",     sortOrder: 30, name: "Gold Reward",     description: "Placeholder — high-value prize. Details TBD.",              costPoints: 1200, stock: -1, emoji: "🥇", accent: "green"  },
  { id: "tier-platinum", sortOrder: 40, name: "Platinum Reward", description: "Placeholder — top-tier prize, signed merch / VIP. Details TBD.", costPoints: 2000, stock: -1, emoji: "🏆", accent: "green"  },
];

// ---------- In-memory store + helpers ----------

type V2Store = {
  challenges: UnifiedChallenge[];
  tiers: PrizeTier[];
  completions: ChallengeCompletion[];
  redemptions: PrizeRedemption[];
};

declare global {
  // eslint-disable-next-line no-var
  var __3X3_V2_STORE__: V2Store | undefined;
}

function getV2Store(): V2Store {
  if (!globalThis.__3X3_V2_STORE__) {
    globalThis.__3X3_V2_STORE__ = {
      challenges: UNIFIED_CHALLENGES.map((c) => ({ ...c })),
      tiers: PRIZE_TIERS.map((t) => ({ ...t })),
      completions: [],
      redemptions: [],
    };
  } else {
    // Refresh definitions from seed so hot reload picks up copy/layout changes.
    // User completions and redemptions are kept in memory.
    globalThis.__3X3_V2_STORE__.challenges = UNIFIED_CHALLENGES.map((c) => ({
      ...c,
    }));
    globalThis.__3X3_V2_STORE__.tiers = PRIZE_TIERS.map((t) => ({ ...t }));
  }
  return globalThis.__3X3_V2_STORE__;
}

// ---------- Reads ----------

export function listUnifiedChallenges(): UnifiedChallenge[] {
  return [...getV2Store().challenges].sort(
    (a, b) =>
      a.location.localeCompare(b.location) || a.sortOrder - b.sortOrder
  );
}

export function getUnifiedChallengeById(id: string): UnifiedChallenge | undefined {
  return getV2Store().challenges.find((c) => c.id === id);
}

export type LocationGroup = { location: string; challenges: UnifiedChallenge[] };

export function listChallengesByLocation(): LocationGroup[] {
  const groups = new Map<string, UnifiedChallenge[]>();
  for (const c of listUnifiedChallenges()) {
    const arr = groups.get(c.location) ?? [];
    arr.push(c);
    groups.set(c.location, arr);
  }
  // Preserve insertion order from seed
  const order = Array.from(new Set(UNIFIED_CHALLENGES.map((c) => c.location)));
  return order
    .map((loc) => ({ location: loc, challenges: groups.get(loc) ?? [] }))
    .filter((g) => g.challenges.length > 0);
}

export function listPrizeTiers(): PrizeTier[] {
  return [...getV2Store().tiers].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPrizeTierById(id: string): PrizeTier | undefined {
  return getV2Store().tiers.find((t) => t.id === id);
}

export function userCompletions(userId: string): ChallengeCompletion[] {
  return getV2Store().completions.filter((c) => c.userId === userId);
}

export function userRedemptions(userId: string): PrizeRedemption[] {
  return getV2Store().redemptions.filter((r) => r.userId === userId);
}

export function userPointsEarned(userId: string): number {
  return userCompletions(userId).reduce((s, c) => s + c.pointsAwarded, 0);
}

export function userPointsSpent(userId: string): number {
  return userRedemptions(userId).reduce((s, r) => s + r.costPoints, 0);
}

export function userPointsBalance(userId: string): number {
  return userPointsEarned(userId) - userPointsSpent(userId);
}

export function userCompletedIds(userId: string): Set<string> {
  return new Set(userCompletions(userId).map((c) => c.challengeId));
}

// ---------- Mutations ----------

export type CompleteResult =
  | { ok: true; pointsAwarded: number }
  | { ok: false; error: "invalid_challenge" | "already_completed" | "wrong_code" | "wrong_letters" | "code_required" | "letters_required" };

function normalizeCode(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, "");
}

export function completeChallenge(
  userId: string,
  challengeId: string,
  submission?: { code?: string; letters?: string[] }
): CompleteResult {
  const store = getV2Store();
  const chal = store.challenges.find((c) => c.id === challengeId);
  if (!chal) return { ok: false, error: "invalid_challenge" };
  if (store.completions.some((c) => c.userId === userId && c.challengeId === challengeId)) {
    return { ok: false, error: "already_completed" };
  }

  if (chal.verification === "code") {
    if (!submission?.code) return { ok: false, error: "code_required" };
    if (normalizeCode(submission.code) !== normalizeCode(chal.code ?? "")) {
      return { ok: false, error: "wrong_code" };
    }
  } else if (chal.verification === "fence") {
    if (!chal.letters || chal.letters.length === 0) {
      return { ok: false, error: "letters_required" };
    }
    const submitted = submission?.letters?.map((l) => l.trim().toUpperCase()).join("") ?? "";
    const expected = chal.letters.join("").toUpperCase();
    if (submitted !== expected) return { ok: false, error: "wrong_letters" };
  }
  // "manual" and "photo" succeed unconditionally (photo upload handled elsewhere).

  store.completions.push({
    userId,
    challengeId: chal.id,
    pointsAwarded: chal.points,
    completedAt: new Date().toISOString(),
  });
  return { ok: true, pointsAwarded: chal.points };
}

export type RedeemResult =
  | { ok: true; voucherCode: string; cost: number; balance: number }
  | { ok: false; error: "invalid_tier" | "insufficient_points" | "out_of_stock" };

function randomVoucher(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function redeemTier(userId: string, tierId: string): RedeemResult {
  const store = getV2Store();
  const tier = store.tiers.find((t) => t.id === tierId);
  if (!tier) return { ok: false, error: "invalid_tier" };
  if (tier.stock === 0) return { ok: false, error: "out_of_stock" };
  if (userPointsBalance(userId) < tier.costPoints) {
    return { ok: false, error: "insufficient_points" };
  }
  const voucher = randomVoucher();
  store.redemptions.push({
    id: `red-${userId}-${tier.id}-${Date.now()}`,
    userId,
    tierId: tier.id,
    costPoints: tier.costPoints,
    voucherCode: voucher,
    claimedAt: new Date().toISOString(),
    redeemedAt: null,
  });
  if (tier.stock > 0) tier.stock -= 1;
  return {
    ok: true,
    voucherCode: voucher,
    cost: tier.costPoints,
    balance: userPointsBalance(userId),
  };
}

// ---------- Day-flag helpers ----------

export function isChallengeAvailable(c: UnifiedChallenge, today?: DayFlag): boolean {
  if (!c.dayFlag) return true;
  if (!today) return false;
  return c.dayFlag === today;
}

/** What "day" is it for the festival? Returns null outside the festival window. */
export function currentFestivalDay(now: Date = new Date()): DayFlag | "sunday" | null {
  // Festival is 19-21 June 2026.
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  if (y !== 2026 || m !== 6) return null;
  if (d === 19) return "friday";
  if (d === 20) return "saturday";
  if (d === 21) return "sunday";
  return null;
}
