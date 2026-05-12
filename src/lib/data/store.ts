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
} from "./seed";
import type {
  Badge,
  Challenge,
  ChallengeAttempt,
  JourneyStep,
  Photo,
  PhotoLike,
  PollVote,
  Profile,
  QrCode,
  Reward,
  RewardClaim,
  StepCompletion,
  UserBadge,
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
  };
}

export function getStore(): Store {
  if (!globalThis.__3X3_STORE__) {
    globalThis.__3X3_STORE__ = buildStore();
  }
  return globalThis.__3X3_STORE__;
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

export function totalPoints(userId: string): number {
  const completions = userCompletions(userId);
  const steps = getStore().journeySteps;
  const stepPts = completions.reduce((sum, c) => {
    const step = steps.find((s) => s.id === c.stepId);
    return sum + (step?.points ?? 0);
  }, 0);
  const attemptPts = userAttempts(userId).reduce((sum, a) => sum + a.awardedPoints, 0);
  return stepPts + attemptPts;
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
