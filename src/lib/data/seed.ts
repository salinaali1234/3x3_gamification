import type {
  Badge,
  Challenge,
  JourneyStep,
  Photo,
  PhotoLike,
  Profile,
  Reward,
  StepCompletion,
  UserBadge,
  ChallengeAttempt,
  QrCode,
} from "./types";

const AVATAR_COLORS = [
  "#BEFF00",
  "#FF6701",
  "#00FFFF",
  "#F3EEE4",
  "#9B5DE5",
  "#FF477E",
  "#06D6A0",
  "#FFD60A",
];

const FIRST_NAMES = [
  "Amir",
  "Noor",
  "Liam",
  "Sara",
  "Daan",
  "Yara",
  "Sven",
  "Fatima",
  "Bram",
  "Lotte",
  "Tarik",
  "Eva",
  "Joost",
  "Aaliyah",
  "Mees",
  "Nora",
  "Tim",
  "Imane",
  "Lars",
  "Sophie",
  "Mo",
  "Sanne",
  "Jay",
  "Layla",
  "Kai",
  "Romy",
  "Ravi",
  "Senna",
  "Robin",
  "Demi",
];

const LAST_INITIALS = [
  "vd Berg",
  "Jansen",
  "Bakker",
  "Hassan",
  "El Idrissi",
  "Visser",
  "de Jong",
  "Yilmaz",
  "Pieters",
  "Diallo",
  "Smit",
  "Chen",
  "Okoye",
  "Mulder",
  "Khan",
];

export const SEED_JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "step-1",
    order: 1,
    code: "JOURNEY-01",
    title: { nl: "Rabobank Court Leader Activatie", en: "Rabobank Court Leader Activation" },
    location: { nl: "Court 1 — Rabobank zone", en: "Court 1 — Rabobank zone" },
    description: {
      nl: "Check in bij de leader activatie en scan de QR op de Rabobank banner.",
      en: "Check in at the leader activation and scan the QR on the Rabobank banner.",
    },
    points: 50,
    qrCode: "JOURNEY-01",
    accent: "orange",
  },
  {
    id: "step-2",
    order: 2,
    code: "JOURNEY-02",
    title: { nl: "De Bus", en: "The Bus" },
    location: { nl: "Bus area — entree", en: "Bus area — entrance" },
    description: {
      nl: "Vind de 3x3 Unites bus en scan de QR aan de zijkant.",
      en: "Find the 3x3 Unites bus and scan the QR on its side.",
    },
    points: 40,
    qrCode: "JOURNEY-02",
    accent: "orange",
  },
  {
    id: "step-3",
    order: 3,
    code: "JOURNEY-03",
    title: { nl: "Leader Ads Installatie", en: "Leader Ads Installation" },
    location: { nl: "Hoofdingang — billboard wall", en: "Main entrance — billboard wall" },
    description: {
      nl: "Bekijk de leader ads en scan de QR onderaan.",
      en: "Check out the leader ads and scan the QR at the bottom.",
    },
    points: 40,
    qrCode: "JOURNEY-03",
    accent: "blue",
  },
  {
    id: "step-4",
    order: 4,
    code: "JOURNEY-04",
    title: { nl: "KFC / Street Court", en: "KFC / Street Court" },
    location: { nl: "Street court — buiten", en: "Street court — outside" },
    description: {
      nl: "Speel een minuut op het street court en scan de QR op de boarding.",
      en: "Play one minute on the street court and scan the QR on the boarding.",
    },
    points: 50,
    qrCode: "JOURNEY-04",
    accent: "orange",
  },
  {
    id: "step-5",
    order: 5,
    code: "JOURNEY-05",
    title: { nl: "Merch Stand", en: "Merch Stand" },
    location: { nl: "Merch zone", en: "Merch zone" },
    description: {
      nl: "Bekijk de drop en scan de QR op het merch display.",
      en: "Check the drop and scan the QR on the merch display.",
    },
    points: 30,
    qrCode: "JOURNEY-05",
    accent: "green",
  },
  {
    id: "step-6",
    order: 6,
    code: "JOURNEY-06",
    title: { nl: "Practice Court", en: "Practice Court" },
    location: { nl: "Practice court — warm-up zone", en: "Practice court — warm-up zone" },
    description: {
      nl: "Watch een warm-up en scan de QR op de assistentenbank.",
      en: "Watch a warm-up and scan the QR on the assistants bench.",
    },
    points: 40,
    qrCode: "JOURNEY-06",
    accent: "orange",
  },
  {
    id: "step-7",
    order: 7,
    code: "JOURNEY-07",
    title: { nl: "Big Court", en: "Big Court" },
    location: { nl: "Center court", en: "Center court" },
    description: {
      nl: "Pak je seat op het center court en scan de QR op de scoretafel.",
      en: "Take your seat at center court and scan the QR on the scorers table.",
    },
    points: 60,
    qrCode: "JOURNEY-07",
    accent: "orange",
  },
  {
    id: "step-8",
    order: 8,
    code: "JOURNEY-08",
    title: { nl: "DJ Booth", en: "DJ Booth" },
    location: { nl: "Main stage — DJ booth", en: "Main stage — DJ booth" },
    description: {
      nl: "Vote op het volgende nummer en scan de QR bij de DJ booth.",
      en: "Vote for the next song and scan the QR at the DJ booth.",
    },
    points: 30,
    qrCode: "JOURNEY-08",
    accent: "green",
  },
  {
    id: "step-9",
    order: 9,
    code: "JOURNEY-09",
    title: { nl: "Meet a Leader", en: "Meet a Leader" },
    location: { nl: "Leader lounge", en: "Leader lounge" },
    description: {
      nl: "Ontmoet een 3x3 leader en scan de QR op hun lanyard.",
      en: "Meet a 3x3 leader and scan the QR on their lanyard.",
    },
    points: 70,
    qrCode: "JOURNEY-09",
    accent: "blue",
  },
  {
    id: "step-10",
    order: 10,
    code: "JOURNEY-10",
    title: { nl: "Finale Ceremonie", en: "Finals Ceremony" },
    location: { nl: "Center court — podium", en: "Center court — podium" },
    description: {
      nl: "Vier de finale en scan de laatste QR op het podium.",
      en: "Celebrate the finals and scan the last QR at the podium.",
    },
    points: 100,
    qrCode: "JOURNEY-10",
    accent: "orange",
  },
];

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: "ch-dj-poll",
    type: "poll",
    title: { nl: "Live DJ poll", en: "Live DJ poll" },
    description: {
      nl: "Vote welk nummer de DJ als volgende moet draaien.",
      en: "Vote which song the DJ should play next.",
    },
    points: 20,
    accent: "green",
    payload: {
      type: "poll",
      data: {
        question: { nl: "Welk nummer als volgende?", en: "Which track next?" },
        options: [
          { nl: "Hardstyle banger", en: "Hardstyle banger" },
          { nl: "Afrobeats jam", en: "Afrobeats jam" },
          { nl: "Throwback hiphop", en: "Throwback hiphop" },
          { nl: "Amapiano vibe", en: "Amapiano vibe" },
        ],
      },
    },
  },
  {
    id: "ch-panna-qr",
    type: "panna_qr",
    title: { nl: "Find the hidden panna QR", en: "Find the hidden panna QR" },
    description: {
      nl: "Een QR is verstopt in de panna cage. Vind hem en scan.",
      en: "A QR code is hidden in the panna cage. Find it and scan.",
    },
    points: 75,
    accent: "orange",
    payload: {
      type: "panna_qr",
      data: {
        hint: {
          nl: "Kijk onder de zwarte mat.",
          en: "Look under the black mat.",
        },
        qrCode: "PANNA-HIDDEN-01",
      },
    },
  },
  {
    id: "ch-leader-trivia",
    type: "trivia",
    title: { nl: "Leader trivia", en: "Leader trivia" },
    description: {
      nl: "Hoeveel 3x3 leaders zijn er dit jaar opgeleid via 3x3 Unites Academy?",
      en: "How many 3x3 leaders graduated from the 3x3 Unites Academy this year?",
    },
    points: 30,
    accent: "blue",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Hoeveel 3x3 leaders zijn er dit jaar opgeleid?",
          en: "How many 3x3 leaders graduated this year?",
        },
        options: [
          { nl: "12", en: "12" },
          { nl: "24", en: "24" },
          { nl: "48", en: "48" },
          { nl: "Geen idee, maar veel", en: "No idea, but a lot" },
        ],
        correctIndex: 1,
      },
    },
  },
  {
    id: "ch-score-input",
    type: "score_input",
    title: { nl: "Schrijf de eindstand op", en: "Note the final score" },
    description: {
      nl: "Bekijk een match en voer de eindstand in om punten te verdienen.",
      en: "Watch a match and submit the final score to earn points.",
    },
    points: 40,
    accent: "orange",
    payload: {
      type: "score_input",
      data: {
        matchLabel: {
          nl: "Quarterfinal 1 — Amsterdam vs Utrecht",
          en: "Quarterfinal 1 — Amsterdam vs Utrecht",
        },
        correctScore: "21-18",
      },
    },
  },
  {
    id: "ch-hekken",
    type: "trivia",
    title: { nl: "Hekken installatie quiz", en: "Fencing installation quiz" },
    description: {
      nl: "Welke leader staat op het hekken installatie artwork?",
      en: "Which leader is on the fencing installation artwork?",
    },
    points: 25,
    accent: "blue",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Welke leader staat op het hekken artwork?",
          en: "Which leader is on the fencing artwork?",
        },
        options: [
          { nl: "Worthy de Jong", en: "Worthy de Jong" },
          { nl: "Jessey Voorn", en: "Jessey Voorn" },
          { nl: "Dimeo van der Horst", en: "Dimeo van der Horst" },
          { nl: "Arvin Slagter", en: "Arvin Slagter" },
        ],
        correctIndex: 2,
      },
    },
  },
  {
    id: "ch-merch",
    type: "trivia",
    title: { nl: "Vul de merch punten in", en: "Fill in the merch points" },
    description: {
      nl: "Hoeveel punten kost de signature hoodie?",
      en: "How many points does the signature hoodie cost?",
    },
    points: 20,
    accent: "green",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Punten voor de signature hoodie?",
          en: "Points for the signature hoodie?",
        },
        options: [
          { nl: "150", en: "150" },
          { nl: "200", en: "200" },
          { nl: "300", en: "300" },
          { nl: "450", en: "450" },
        ],
        correctIndex: 2,
      },
    },
  },
  {
    id: "ch-painting",
    type: "trivia",
    title: { nl: "Waar gaat de painting over?", en: "What is the painting about?" },
    description: {
      nl: "Op het court staat een painting. Wat is het thema? 2 shots, 1 minuut penalty bij fout.",
      en: "There's a painting on the court. What's the theme? 2 shots, 1 min penalty if wrong.",
    },
    points: 35,
    accent: "green",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Het thema van de painting is:",
          en: "The theme of the painting is:",
        },
        options: [
          { nl: "Streetlife in Rotterdam", en: "Streetlife in Rotterdam" },
          { nl: "Generations of basketball", en: "Generations of basketball" },
          { nl: "Unity through music", en: "Unity through music" },
          { nl: "From the streets to the top", en: "From the streets to the top" },
        ],
        correctIndex: 3,
      },
    },
  },
  {
    id: "ch-dome",
    type: "trivia",
    title: { nl: "Wat gebeurt er in de dome?", en: "What happens in the dome?" },
    description: {
      nl: "De dome heeft een speciale activiteit voor NXT LVL deelnemers.",
      en: "The dome has a special activity for NXT LVL participants.",
    },
    points: 30,
    accent: "blue",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Wat is de hoofdactiviteit in de dome?",
          en: "What is the main activity in the dome?",
        },
        options: [
          { nl: "NXT LVL skills clinic", en: "NXT LVL skills clinic" },
          { nl: "Sneaker swap", en: "Sneaker swap" },
          { nl: "VR shootout", en: "VR shootout" },
          { nl: "Stilte ruimte", en: "Silent room" },
        ],
        correctIndex: 0,
      },
    },
  },
];

export const SEED_BADGES: Badge[] = [
  {
    id: "badge-first-step",
    code: "FIRST_STEP",
    name: { nl: "Eerste stap", en: "First step" },
    description: {
      nl: "Je hebt je eerste stap op de journey gezet.",
      en: "You took your first step on the journey.",
    },
    emoji: "👟",
    accent: "green",
    criterion: { kind: "steps_completed", threshold: 1 },
  },
  {
    id: "badge-halfway",
    code: "HALFWAY",
    name: { nl: "Halverwege", en: "Halfway" },
    description: {
      nl: "5 van de 10 stappen voltooid.",
      en: "5 of 10 steps completed.",
    },
    emoji: "🏀",
    accent: "orange",
    criterion: { kind: "steps_completed", threshold: 5 },
  },
  {
    id: "badge-top",
    code: "TOP",
    name: { nl: "From the Top", en: "From the Top" },
    description: {
      nl: "Alle 10 stappen voltooid. Je bent bij de top.",
      en: "All 10 steps completed. You made it to the top.",
    },
    emoji: "👑",
    accent: "orange",
    criterion: { kind: "all_steps" },
  },
  {
    id: "badge-trivia-master",
    code: "TRIVIA_MASTER",
    name: { nl: "Trivia master", en: "Trivia master" },
    description: {
      nl: "5 challenges voltooid.",
      en: "5 challenges completed.",
    },
    emoji: "🧠",
    accent: "blue",
    criterion: { kind: "challenges_completed", threshold: 5 },
  },
  {
    id: "badge-photographer",
    code: "PHOTOGRAPHER",
    name: { nl: "Photographer", en: "Photographer" },
    description: {
      nl: "Foto geüpload naar de photo contest.",
      en: "Uploaded a photo to the photo contest.",
    },
    emoji: "📸",
    accent: "green",
    criterion: { kind: "photo_uploaded" },
  },
  {
    id: "badge-score-spotter",
    code: "SCORE_SPOTTER",
    name: { nl: "Score spotter", en: "Score spotter" },
    description: {
      nl: "Eindstand correct ingevoerd.",
      en: "Correctly submitted a match score.",
    },
    emoji: "🎯",
    accent: "orange",
    criterion: { kind: "score_correct" },
  },
];

export const SEED_REWARDS: Reward[] = [
  {
    id: "rw-food",
    name: { nl: "Food voucher", en: "Food voucher" },
    description: {
      nl: "Eén maaltijd bij de food trucks.",
      en: "One meal at the food trucks.",
    },
    type: "food",
    costPoints: 150,
    stock: 50,
    emoji: "🍔",
    accent: "green",
  },
  {
    id: "rw-water",
    name: { nl: "Gratis water", en: "Free water" },
    description: {
      nl: "Een fles water bij de bar.",
      en: "A bottle of water at the bar.",
    },
    type: "water",
    costPoints: 50,
    stock: 200,
    emoji: "💧",
    accent: "blue",
  },
  {
    id: "rw-merch",
    name: { nl: "Merch voucher", en: "Merch voucher" },
    description: {
      nl: "€10 korting op merchandise.",
      en: "€10 off merchandise.",
    },
    type: "merch_voucher",
    costPoints: 250,
    stock: 30,
    emoji: "🧢",
    accent: "orange",
  },
  {
    id: "rw-autograph",
    name: { nl: "Speler handtekening", en: "Player autograph" },
    description: {
      nl: "Handtekening van een 3x3 topspeler.",
      en: "Autograph from a 3x3 top player.",
    },
    type: "autograph",
    costPoints: 400,
    stock: 10,
    emoji: "✍️",
    accent: "orange",
  },
  {
    id: "rw-speaker",
    name: { nl: "Bluetooth speaker", en: "Bluetooth speaker" },
    description: {
      nl: "3x3 Unites branded speaker.",
      en: "3x3 Unites branded speaker.",
    },
    type: "speaker",
    costPoints: 600,
    stock: 5,
    emoji: "🔊",
    accent: "green",
  },
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = rng(42);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function buildSeedProfiles(): Profile[] {
  const profiles: Profile[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (profiles.length < 30 && i < 200) {
    i++;
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_INITIALS);
    const name = `${first} ${last}`;
    if (seen.has(name)) continue;
    seen.add(name);
    profiles.push({
      id: `user-${profiles.length + 1}`,
      cmTicketId: `CM-${100000 + profiles.length}`,
      displayName: name,
      email: `${first.toLowerCase()}.${profiles.length}@demo.3x3unites.nl`,
      avatarColor: AVATAR_COLORS[profiles.length % AVATAR_COLORS.length],
      role: profiles.length === 0 ? "admin" : "participant",
      createdAt: new Date(Date.now() - profiles.length * 3600_000).toISOString(),
    });
  }
  profiles[0].displayName = "Admin Salina";
  return profiles;
}

export function buildSeedCompletions(profiles: Profile[]): StepCompletion[] {
  const out: StepCompletion[] = [];
  profiles.forEach((p, idx) => {
    if (p.role === "admin") return;
    const count = Math.max(0, Math.min(10, Math.floor((30 - idx) / 3)));
    for (let s = 0; s < count; s++) {
      out.push({
        userId: p.id,
        stepId: SEED_JOURNEY_STEPS[s].id,
        completedAt: new Date(Date.now() - (idx * 1000 + s * 100) * 1000).toISOString(),
      });
    }
  });
  return out;
}

export function buildSeedAttempts(profiles: Profile[]): ChallengeAttempt[] {
  const out: ChallengeAttempt[] = [];
  profiles.forEach((p, idx) => {
    if (p.role === "admin") return;
    const count = Math.max(0, Math.min(SEED_CHALLENGES.length, Math.floor((25 - idx) / 4)));
    for (let c = 0; c < count; c++) {
      const ch = SEED_CHALLENGES[c];
      out.push({
        id: `att-${p.id}-${ch.id}`,
        userId: p.id,
        challengeId: ch.id,
        answer: null,
        correct: true,
        awardedPoints: ch.points,
        createdAt: new Date(Date.now() - (idx * 600 + c * 60) * 1000).toISOString(),
      });
    }
  });
  return out;
}

export function buildSeedBadges(
  profiles: Profile[],
  completions: StepCompletion[],
  attempts: ChallengeAttempt[]
): UserBadge[] {
  const out: UserBadge[] = [];
  profiles.forEach((p) => {
    const stepCount = completions.filter((c) => c.userId === p.id).length;
    const chCount = attempts.filter((a) => a.userId === p.id && a.correct).length;
    if (stepCount >= 1) out.push({ userId: p.id, badgeId: "badge-first-step", earnedAt: new Date().toISOString() });
    if (stepCount >= 5) out.push({ userId: p.id, badgeId: "badge-halfway", earnedAt: new Date().toISOString() });
    if (stepCount >= 10) out.push({ userId: p.id, badgeId: "badge-top", earnedAt: new Date().toISOString() });
    if (chCount >= 5) out.push({ userId: p.id, badgeId: "badge-trivia-master", earnedAt: new Date().toISOString() });
  });
  return out;
}

const PHOTO_CAPTIONS = [
  "Dunk of the day",
  "Pre-game vibe",
  "Streets to the top",
  "Crew thru",
  "Court energy",
  "Leader pull-up",
  "Center court madness",
  "Got the merch",
  "Panna found",
  "Backstage with the DJ",
  "Warm-up squad",
  "Halftime show",
  "Sunset on the court",
  "Family at the games",
  "First time at 3x3",
  "Brought the kids",
  "Foam finger ready",
  "Bus stop selfie",
  "Front row seats",
  "Trophy in sight",
];

// Photo placeholders: use a stable gradient image generator (no real photo data)
export function buildSeedPhotos(profiles: Profile[]): Photo[] {
  return PHOTO_CAPTIONS.map((caption, i) => {
    const user = profiles[(i + 1) % profiles.length];
    const color = encodeURIComponent(user.avatarColor.replace("#", ""));
    return {
      id: `photo-${i + 1}`,
      userId: user.id,
      imageUrl: `https://picsum.photos/seed/3x3-${i}-${color}/640/640`,
      caption,
      hashtag: i % 3 === 0 ? "3x3unites" : i % 3 === 1 ? "streetstothetop" : "courtside",
      createdAt: new Date(Date.now() - i * 1800_000).toISOString(),
    };
  });
}

export function buildSeedPhotoLikes(profiles: Profile[], photos: Photo[]): PhotoLike[] {
  const out: PhotoLike[] = [];
  photos.forEach((photo, i) => {
    const likeCount = ((i * 7) % 11) + 1;
    for (let k = 0; k < likeCount; k++) {
      const user = profiles[(k * 3 + i) % profiles.length];
      if (user.id !== photo.userId) {
        out.push({ userId: user.id, photoId: photo.id });
      }
    }
  });
  return out;
}

export function buildSeedQrCodes(): QrCode[] {
  const stepCodes: QrCode[] = SEED_JOURNEY_STEPS.map((s) => ({
    code: s.qrCode,
    targetType: "step",
    targetId: s.id,
    active: true,
  }));
  const challengeCodes: QrCode[] = SEED_CHALLENGES.filter((c) => c.type === "panna_qr").map((c) => ({
    code: (c.payload as Extract<Challenge["payload"], { type: "panna_qr" }>).data.qrCode,
    targetType: "challenge",
    targetId: c.id,
    active: true,
  }));
  return [...stepCodes, ...challengeCodes];
}
