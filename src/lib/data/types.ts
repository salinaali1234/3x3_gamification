export type Role = "participant" | "admin";

export type Bilingual = { nl: string; en: string };

export type Profile = {
  id: string;
  /** Optional link to cm.nl order; not required for web registration */
  cmTicketId?: string | null;
  displayName: string;
  email: string;
  avatarColor: string;
  role: Role;
  createdAt: string;
};

export type JourneyVerifyMethod = "code" | "photo";

export type JourneyStep = {
  id: string;
  order: number;
  code: string;
  title: Bilingual;
  location: Bilingual;
  description: Bilingual;
  qrCode: string;
  accent: "green" | "orange" | "blue";
  /** How participants prove they were there */
  verifyMethod?: JourneyVerifyMethod;
  /** Main quest point reward (typically 100+) */
  points: number;
  /** Forced position — true means must be the LAST quest unlocked */
  isFinal?: boolean;
};

export type FestivalDay = "friday" | "saturday" | "sunday";

export type SideEvent = {
  id: string;
  day: FestivalDay;
  startTime: string;
  endTime: string;
  title: Bilingual;
  description: Bilingual;
  location: Bilingual;
  host?: string;
  kind: "activation" | "match" | "show" | "meet";
};

export type LiveMatch = {
  id: string;
  day: FestivalDay;
  startTime: string;
  label: Bilingual;
  teamA: string;
  teamB: string;
  /** Set by admin once match is final; null while live/upcoming */
  finalScore: string | null;
};

export type WheelPrize = {
  id: string;
  label: Bilingual;
  emoji: string;
  weight: number;
};

export type WheelSpin = {
  id: string;
  userId: string;
  prizeId: string;
  createdAt: string;
};

export type StepCompletion = {
  userId: string;
  stepId: string;
  completedAt: string;
};

export type ChallengeType =
  | "trivia"
  | "poll"
  | "score_input"
  | "photo"
  | "bingo"
  | "panna_qr";

export type ChallengeAccent = "green" | "orange" | "blue";

export type TriviaPayload = {
  question: Bilingual;
  options: Bilingual[];
  correctIndex: number;
  timeLimitSec?: number;
};

export type PollPayload = {
  question: Bilingual;
  options: Bilingual[];
};

export type ScoreInputPayload = {
  matchLabel: Bilingual;
  correctScore: string;
};

export type BingoPayload = {
  squares: Bilingual[];
  rowSize: number;
};

export type PannaQrPayload = {
  hint: Bilingual;
  qrCode: string;
};

export type PhotoChallengePayload = {
  hashtag: string;
};

export type ChallengePayload =
  | { type: "trivia"; data: TriviaPayload }
  | { type: "poll"; data: PollPayload }
  | { type: "score_input"; data: ScoreInputPayload }
  | { type: "bingo"; data: BingoPayload }
  | { type: "panna_qr"; data: PannaQrPayload }
  | { type: "photo"; data: PhotoChallengePayload };

export type Challenge = {
  id: string;
  type: ChallengeType;
  title: Bilingual;
  description: Bilingual;
  points: number;
  accent: ChallengeAccent;
  payload: ChallengePayload;
};

export type ChallengeAttempt = {
  id: string;
  userId: string;
  challengeId: string;
  answer: unknown;
  correct: boolean;
  awardedPoints: number;
  createdAt: string;
};

export type PollVote = {
  userId: string;
  challengeId: string;
  optionIndex: number;
  votedAt: string;
};

export type BadgeCriterionKind =
  | "steps_completed"
  | "challenges_completed"
  | "photo_uploaded"
  | "all_steps"
  | "score_correct"
  | "early_check_in";

export type Badge = {
  id: string;
  code: string;
  name: Bilingual;
  description: Bilingual;
  emoji: string;
  accent: "green" | "orange" | "blue";
  criterion: { kind: BadgeCriterionKind; threshold?: number };
};

export type UserBadge = {
  userId: string;
  badgeId: string;
  earnedAt: string;
};

export type Photo = {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  hashtag: string;
  createdAt: string;
};

export type PhotoLike = {
  userId: string;
  photoId: string;
};

export type RewardType = "food" | "water" | "merch_voucher" | "autograph" | "speaker";

export type Reward = {
  id: string;
  name: Bilingual;
  description: Bilingual;
  type: RewardType;
  costPoints: number;
  stock: number;
  emoji: string;
  accent: "green" | "orange" | "blue";
};

export type RewardClaim = {
  id: string;
  userId: string;
  rewardId: string;
  claimedAt: string;
  voucherCode: string;
};

export type QrCode = {
  code: string;
  targetType: "step" | "challenge";
  targetId: string;
  active: boolean;
};
