import {
  buildSeedAttempts,
  buildSeedBadges,
  buildSeedCompletions,
  buildSeedPhotoLikes,
  buildSeedPhotos,
  buildSeedProfiles,
  buildSeedQrCodes,
  SEED_BADGES,
  SEED_CHALLENGES,
  SEED_JOURNEY_STEPS,
  SEED_REWARDS,
  SEED_WHEEL_PRIZES,
  SEED_SIDE_EVENTS,
  SEED_LIVE_MATCHES,
} from "./seed";
import type {
  Badge,
  Challenge,
  ChallengeAttempt,
  JourneyStep,
  LiveMatch,
  Photo,
  PhotoLike,
  PollVote,
  Profile,
  QrCode,
  Reward,
  RewardClaim,
  SideEvent,
  StepCompletion,
  UserBadge,
  WheelPrize,
  WheelSpin,
} from "./types";

type Store = {
  profiles: Profile[];
  journeySteps: JourneyStep[];
  stepCompletions: StepCompletion[];
  challenges: Challenge[];
  challengeAttempts: ChallengeAttempt[];
  pollVotes: PollVote[];
  badges: Badge[];
  userBadges: UserBadge[];
  photos: Photo[];
  photoLikes: PhotoLike[];
  rewards: Reward[];
  rewardClaims: RewardClaim[];
  qrCodes: QrCode[];
  wheelPrizes: WheelPrize[];
  wheelSpins: WheelSpin[];
  sideEvents: SideEvent[];
  liveMatches: LiveMatch[];
  /** map of matchId -> userId -> score */
  matchScoreSubmissions: Array<{
    userId: string;
    matchId: string;
    submittedScore: string;
    correct: boolean;
    awardedPoints: number;
    createdAt: string;
  }>;
  /** journey step photo uploads */
  stepPhotoUploads: Array<{
    userId: string;
    stepId: string;
    storagePath: string;
    createdAt: string;
  }>;
};

declare global {
  // eslint-disable-next-line no-var
  var __3X3_STORE__: Store | undefined;
}

function buildStore(): Store {
  const profiles = buildSeedProfiles();
  const stepCompletions = buildSeedCompletions(profiles);
  const challengeAttempts = buildSeedAttempts(profiles);
  const userBadges = buildSeedBadges(profiles, stepCompletions, challengeAttempts);
  const photos = buildSeedPhotos(profiles);
  const photoLikes = buildSeedPhotoLikes(profiles, photos);
  return {
    profiles,
    journeySteps: SEED_JOURNEY_STEPS,
    stepCompletions,
    challenges: SEED_CHALLENGES,
    challengeAttempts,
    pollVotes: [],
    badges: SEED_BADGES,
    userBadges,
    photos,
    photoLikes,
    rewards: SEED_REWARDS,
    rewardClaims: [],
    qrCodes: buildSeedQrCodes(),
    wheelPrizes: SEED_WHEEL_PRIZES,
    wheelSpins: [],
    sideEvents: SEED_SIDE_EVENTS,
    liveMatches: SEED_LIVE_MATCHES,
    matchScoreSubmissions: [],
    stepPhotoUploads: [],
  };
}

export function getStore(): Store {
  if (!globalThis.__3X3_STORE__) {
    globalThis.__3X3_STORE__ = buildStore();
  }
  const s = globalThis.__3X3_STORE__;
  // Migrate older in-memory stores from previous dev sessions (HMR keeps globals).
  if (!s.sideEvents) s.sideEvents = SEED_SIDE_EVENTS;
  if (!s.liveMatches) s.liveMatches = SEED_LIVE_MATCHES;
  if (!s.matchScoreSubmissions) s.matchScoreSubmissions = [];
  if (!s.stepPhotoUploads) s.stepPhotoUploads = [];
  if (!s.wheelPrizes) s.wheelPrizes = SEED_WHEEL_PRIZES;
  if (!s.wheelSpins) s.wheelSpins = [];
  return s;
}

export function resetStore() {
  globalThis.__3X3_STORE__ = buildStore();
}

// ---------- Read helpers ----------

export function listProfiles() {
  return getStore().profiles;
}

export function getProfileById(id: string) {
  return getStore().profiles.find((p) => p.id === id);
}

export function getProfileByEmail(email: string) {
  return getStore().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export function listJourneySteps() {
  return getStore().journeySteps;
}

export function getJourneyStepById(id: string) {
  return getStore().journeySteps.find((s) => s.id === id);
}

export function listChallenges() {
  return getStore().challenges;
}

export function getChallengeById(id: string) {
  return getStore().challenges.find((c) => c.id === id);
}

export function listBadges() {
  return getStore().badges;
}

export function getBadgeById(id: string) {
  return getStore().badges.find((b) => b.id === id);
}

export function listRewards() {
  return getStore().rewards;
}

export function getRewardById(id: string) {
  return getStore().rewards.find((r) => r.id === id);
}

export function listPhotos() {
  return [...getStore().photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function listPhotosForUser(userId: string) {
  return listPhotos().filter((p) => p.userId === userId);
}

export function getPhotoById(id: string) {
  return getStore().photos.find((p) => p.id === id);
}

export function listQrCodes() {
  return getStore().qrCodes;
}

export function getQrCode(code: string) {
  return getStore().qrCodes.find((q) => q.code.toUpperCase() === code.toUpperCase() && q.active);
}

// ---------- User-specific helpers ----------

export function userCompletions(userId: string) {
  return getStore().stepCompletions.filter((c) => c.userId === userId);
}

export function userAttempts(userId: string) {
  return getStore().challengeAttempts.filter((a) => a.userId === userId);
}

export function userBadgesFor(userId: string) {
  return getStore().userBadges.filter((b) => b.userId === userId);
}

export function userClaims(userId: string) {
  return getStore().rewardClaims.filter((c) => c.userId === userId);
}

export function userPhotoLikes(userId: string) {
  return getStore().photoLikes.filter((l) => l.userId === userId);
}

// ---------- Aggregations ----------

/** Shop points — only from side challenges + match-score submissions, not the main journey */
export function challengePoints(userId: string): number {
  return userAttempts(userId).reduce((sum, a) => sum + a.awardedPoints, 0);
}

export function matchScorePoints(userId: string): number {
  return userMatchSubmissions(userId).reduce((sum, s) => sum + s.awardedPoints, 0);
}

export function journeyPoints(userId: string): number {
  const store = getStore();
  const doneIds = new Set(
    store.stepCompletions.filter((c) => c.userId === userId).map((c) => c.stepId)
  );
  return store.journeySteps
    .filter((s) => doneIds.has(s.id))
    .reduce((sum, s) => sum + s.points, 0);
}

export function totalPoints(userId: string): number {
  return journeyPoints(userId) + challengePoints(userId) + matchScorePoints(userId);
}

/** 1 wheel spin per 200 points earned (+ spin-again prizes) */
export const POINTS_PER_WHEEL_SPIN = 200;

export function wheelSpinsEarned(userId: string): number {
  const fromPoints = Math.floor(totalPoints(userId) / POINTS_PER_WHEEL_SPIN);
  const spinAgainBonus = getStore().wheelSpins.filter(
    (s) => s.userId === userId && s.prizeId === "wp-spin-again"
  ).length;
  return fromPoints + spinAgainBonus;
}

export function wheelSpinsUsed(userId: string): number {
  return getStore().wheelSpins.filter((s) => s.userId === userId).length;
}

export function wheelSpinsAvailable(userId: string): number {
  return Math.max(0, wheelSpinsEarned(userId) - wheelSpinsUsed(userId));
}

export function listWheelPrizes() {
  return getStore().wheelPrizes;
}

export function getWheelPrizeById(id: string) {
  return getStore().wheelPrizes.find((p) => p.id === id);
}

export function userWheelSpins(userId: string) {
  return getStore().wheelSpins.filter((s) => s.userId === userId);
}

export function pickWheelPrize(): WheelPrize {
  const prizes = getStore().wheelPrizes;
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1]!;
}

export function recordWheelSpin(userId: string, prizeId: string): WheelSpin {
  const spin: WheelSpin = {
    id: `spin-${userId}-${Date.now()}`,
    userId,
    prizeId,
    createdAt: new Date().toISOString(),
  };
  getStore().wheelSpins.push(spin);
  return spin;
}

export type LeaderboardRow = {
  rank: number;
  userId: string;
  displayName: string;
  avatarColor: string;
  points: number;
  badgeIds: string[];
  stepsDone: number;
};

export function leaderboard(limit = 100): LeaderboardRow[] {
  const store = getStore();
  const rows = store.profiles
    .filter((p) => p.role === "participant")
    .map((p) => ({
      userId: p.id,
      displayName: p.displayName,
      avatarColor: p.avatarColor,
      points: totalPoints(p.id),
      badgeIds: store.userBadges.filter((b) => b.userId === p.id).map((b) => b.badgeId),
      stepsDone: store.stepCompletions.filter((c) => c.userId === p.id).length,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }));
  return rows;
}

export function photoLikeCount(photoId: string) {
  return getStore().photoLikes.filter((l) => l.photoId === photoId).length;
}

// ---------- Mutations ----------

export function addProfile(p: Profile) {
  getStore().profiles.push(p);
}

export function addStepCompletion(userId: string, stepId: string) {
  const store = getStore();
  if (store.stepCompletions.some((c) => c.userId === userId && c.stepId === stepId)) {
    return false;
  }
  store.stepCompletions.push({
    userId,
    stepId,
    completedAt: new Date().toISOString(),
  });
  return true;
}

export function addChallengeAttempt(att: ChallengeAttempt) {
  getStore().challengeAttempts.push(att);
}

export function hasChallengeAttempt(userId: string, challengeId: string) {
  return getStore().challengeAttempts.some(
    (a) => a.userId === userId && a.challengeId === challengeId
  );
}

export function addPollVote(v: PollVote) {
  const store = getStore();
  const existing = store.pollVotes.findIndex(
    (x) => x.userId === v.userId && x.challengeId === v.challengeId
  );
  if (existing >= 0) {
    store.pollVotes[existing] = v;
  } else {
    store.pollVotes.push(v);
  }
}

export function pollResults(challengeId: string) {
  return getStore().pollVotes.filter((v) => v.challengeId === challengeId);
}

export function awardBadge(userId: string, badgeId: string) {
  const store = getStore();
  if (store.userBadges.some((b) => b.userId === userId && b.badgeId === badgeId)) return false;
  store.userBadges.push({ userId, badgeId, earnedAt: new Date().toISOString() });
  return true;
}

export const PHOTOS_PER_SESSION = 10;

export function userPhotoCount(userId: string): number {
  return getStore().photos.filter((p) => p.userId === userId).length;
}

export function canUploadPhoto(userId: string): boolean {
  return userPhotoCount(userId) < PHOTOS_PER_SESSION;
}

export function addPhoto(p: Photo) {
  getStore().photos.unshift(p);
}

export function togglePhotoLike(userId: string, photoId: string): boolean {
  const store = getStore();
  const idx = store.photoLikes.findIndex(
    (l) => l.userId === userId && l.photoId === photoId
  );
  if (idx >= 0) {
    store.photoLikes.splice(idx, 1);
    return false;
  }
  store.photoLikes.push({ userId, photoId });
  return true;
}

export function addRewardClaim(claim: RewardClaim) {
  const store = getStore();
  store.rewardClaims.push(claim);
  const reward = store.rewards.find((r) => r.id === claim.rewardId);
  if (reward) reward.stock = Math.max(0, reward.stock - 1);
}

export function updateProfile(userId: string, patch: Partial<Profile>) {
  const store = getStore();
  const profile = store.profiles.find((p) => p.id === userId);
  if (profile) Object.assign(profile, patch);
}

export function addQrCode(qr: QrCode) {
  getStore().qrCodes.push(qr);
}

// ---------- Side events & live matches ----------

export function listSideEvents() {
  return getStore().sideEvents;
}

export function listLiveMatches() {
  return getStore().liveMatches;
}

export function getLiveMatchById(id: string) {
  return getStore().liveMatches.find((m) => m.id === id);
}

export function userMatchSubmissions(userId: string) {
  return getStore().matchScoreSubmissions.filter((s) => s.userId === userId);
}

export function hasMatchSubmission(userId: string, matchId: string) {
  return getStore().matchScoreSubmissions.some(
    (s) => s.userId === userId && s.matchId === matchId
  );
}

/** Submitting a match score awards 1 point if correct */
export function submitMatchScore(userId: string, matchId: string, score: string) {
  const store = getStore();
  if (hasMatchSubmission(userId, matchId)) {
    return { ok: false as const, error: "already" };
  }
  const match = store.liveMatches.find((m) => m.id === matchId);
  if (!match) return { ok: false as const, error: "invalid" };
  if (!match.finalScore) return { ok: false as const, error: "not_final" };

  const correct = match.finalScore.trim() === score.trim();
  const awardedPoints = correct ? 1 : 0;
  store.matchScoreSubmissions.push({
    userId,
    matchId,
    submittedScore: score.trim(),
    correct,
    awardedPoints,
    createdAt: new Date().toISOString(),
  });
  return { ok: true as const, correct, awardedPoints, finalScore: match.finalScore };
}

// ---------- Journey step photo uploads ----------

export function addStepPhotoUpload(userId: string, stepId: string, storagePath: string) {
  getStore().stepPhotoUploads.push({
    userId,
    stepId,
    storagePath,
    createdAt: new Date().toISOString(),
  });
}

export function userStepPhotoUploads(userId: string) {
  return getStore().stepPhotoUploads.filter((p) => p.userId === userId);
}

// ---------- Leader Hub gating ----------

/** Leader Hub (final step) is only completable when every other step is done */
export function canCompleteStep(userId: string, stepId: string): boolean {
  const store = getStore();
  const step = store.journeySteps.find((s) => s.id === stepId);
  if (!step) return false;
  if (!step.isFinal) return true;
  const otherSteps = store.journeySteps.filter((s) => s.id !== stepId);
  const done = new Set(
    store.stepCompletions.filter((c) => c.userId === userId).map((c) => c.stepId)
  );
  return otherSteps.every((s) => done.has(s.id));
}

export function totalCounts() {
  const s = getStore();
  return {
    participants: s.profiles.filter((p) => p.role === "participant").length,
    completions: s.stepCompletions.length,
    attempts: s.challengeAttempts.length,
    photos: s.photos.length,
    claims: s.rewardClaims.length,
  };
}
