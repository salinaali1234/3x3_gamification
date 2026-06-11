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
  WheelPrize,
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
    id: "step-streets",
    order: 1,
    code: "JOURNEY-STREETS",
    title: { nl: "The Streets", en: "The Streets" },
    location: { nl: "The Streets — 3x3 Street League", en: "The Streets — 3x3 Street League" },
    description: {
      nl: "Bekijk een 3x3 Street League-wedstrijd en voer de code in bij de boarding.",
      en: "Watch a 3x3 Street League game and enter the code at the boarding.",
    },
    qrCode: "JOURNEY-STREETS",
    accent: "orange",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-odido-dome",
    order: 2,
    code: "JOURNEY-DOME",
    title: {
      nl: "Interactive Dome — powered by Odido",
      en: "Interactive Dome — powered by Odido",
    },
    location: { nl: "Interactive Dome", en: "Interactive Dome" },
    description: {
      nl: "Bezoek een talk of de AI-ervaring in de Interactive Dome en voer de code in.",
      en: "Visit a talk or the AI experience in the Interactive Dome and enter the code.",
    },
    qrCode: "JOURNEY-DOME",
    accent: "blue",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-rabobus",
    order: 3,
    code: "JOURNEY-RABO",
    title: { nl: "RaboBank Court", en: "RaboBank Court" },
    location: { nl: "RaboBank Court", en: "RaboBank Court" },
    description: {
      nl: "Stap de bus in bij RaboBank Court en voer de code in die je daar vindt.",
      en: "Step inside the bus at RaboBank Court and enter the code you find there.",
    },
    qrCode: "JOURNEY-RABO",
    accent: "orange",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-food-court",
    order: 4,
    code: "JOURNEY-FOOD",
    title: { nl: "Food Court", en: "Food Court" },
    location: { nl: "Food Court", en: "Food Court" },
    description: {
      nl: "Bezoek de Food Court en voer de code in bij de activatie.",
      en: "Visit the Food Court and enter the code at the activation.",
    },
    qrCode: "JOURNEY-FOOD",
    accent: "green",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-community",
    order: 5,
    code: "JOURNEY-COMMUNITY",
    title: { nl: "Community Corner", en: "Community Corner" },
    location: { nl: "Community Corner — Sneakerness", en: "Community Corner — Sneakerness" },
    description: {
      nl: "Ga naar de Sneakerness-activatie in de Community Corner en voer de code in.",
      en: "Visit the Sneakerness activation at the Community Corner and enter the code.",
    },
    qrCode: "JOURNEY-COMMUNITY",
    accent: "blue",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-panna",
    order: 6,
    code: "JOURNEY-PANNA",
    title: { nl: "Panna KO", en: "Panna KO" },
    location: { nl: "Panna Courts", en: "Panna Courts" },
    description: {
      nl: "Bekijk een Panna KO-wedstrijd en voer de code in bij de cage.",
      en: "Watch a Panna KO match and enter the code at the cage.",
    },
    qrCode: "JOURNEY-PANNA",
    accent: "orange",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-leader-center",
    order: 7,
    code: "JOURNEY-LEADER-CENTER",
    title: { nl: "3X3 Leader Centre", en: "3X3 Leader Centre" },
    location: { nl: "3X3 Leader Centre", en: "3X3 Leader Centre" },
    description: {
      nl: "Meld je aan voor een clinic of Rembrandt 3X3 Leader course bij het 3X3 Leader Centre.",
      en: "Sign up for a clinic or Rembrandt 3X3 Leader course at the 3X3 Leader Centre.",
    },
    qrCode: "JOURNEY-LEADER-CENTER",
    accent: "blue",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-warmup",
    order: 8,
    code: "JOURNEY-WARMUP",
    title: { nl: "Warm-up Court", en: "Warm-up Court" },
    location: { nl: "Warm-up Court", en: "Warm-up Court" },
    description: {
      nl: "Bekijk de pros warm-uppen op het Warm-up Court en voer de code in.",
      en: "Watch the pros warm up on the Warm-up Court and enter the code.",
    },
    qrCode: "JOURNEY-WARMUP",
    accent: "orange",
    points: 100,
    verifyMethod: "code",
  },
  {
    id: "step-hekken",
    order: 9,
    code: "JOURNEY-HEKKEN",
    title: { nl: "3X3 Leader exhibition", en: "3X3 Leader exhibition" },
    location: {
      nl: "3X3 Leader exhibition (3 structuren)",
      en: "3X3 Leader exhibition (3 structures)",
    },
    description: {
      nl: "Spot de 3X3 Leader op de 3X3 Leader exhibition — 10 jaar 3X3 Unites storytelling.",
      en: "Spot the 3X3 Leader at the 3X3 Leader exhibition — 10 years of 3X3 Unites storytelling.",
    },
    qrCode: "JOURNEY-HEKKEN",
    accent: "blue",
    points: 100,
    verifyMethod: "code",
  },
];

export const SEED_SIDE_EVENTS: import("./types").SideEvent[] = [];

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: "ch-merch-drop",
    type: "trivia",
    title: { nl: "Merch Drop side event", en: "Merch Drop side event" },
    description: {
      nl: "Bezoek de merch zone en beantwoord welke kleur de drop deze editie is.",
      en: "Visit the merch zone and answer what colour the drop is this edition.",
    },
    points: 25,
    accent: "green",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Welke kleur staat centraal in de merch drop?",
          en: "What is the headline colour of the merch drop?",
        },
        options: [
          { nl: "Brand groen", en: "Brand green" },
          { nl: "Brand oranje", en: "Brand orange" },
          { nl: "Brand blauw", en: "Brand blue" },
          { nl: "Off-white", en: "Off-white" },
        ],
        correctIndex: 0,
      },
    },
  },
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
    id: "ch-ar-prompt",
    type: "panna_qr",
    title: { nl: "AR / VR prompt", en: "AR / VR prompt" },
    description: {
      nl: "Maak een prompt bij de AR/VR booth, laat de host het resultaat zien en krijg de code.",
      en: "Create a prompt at the AR/VR booth, show the host your result and receive the code.",
    },
    points: 50,
    accent: "blue",
    payload: {
      type: "panna_qr",
      data: {
        hint: {
          nl: "Booth geeft een unieke code zodra je prompt af is.",
          en: "Booth hands you a unique code once your prompt is done.",
        },
        qrCode: "AR-PROMPT-01",
      },
    },
  },
  {
    id: "ch-go-bald",
    type: "panna_qr",
    title: { nl: "Go bald 🪒", en: "Go bald 🪒" },
    description: {
      nl: "Durf jij het kale-hoofd avontuur aan bij de barbershop booth? Krijg de code van de barber na de cut.",
      en: "Brave enough to go bald at the barbershop booth? Get the code from the barber after the cut.",
    },
    points: 50,
    accent: "orange",
    payload: {
      type: "panna_qr",
      data: {
        hint: {
          nl: "Alleen de barber kan deze code afgeven.",
          en: "Only the barber can hand out this code.",
        },
        qrCode: "BALD-01",
      },
    },
  },
  {
    id: "ch-panna-qr",
    type: "panna_qr",
    title: { nl: "Vind de verborgen codes", en: "Find the hidden codes" },
    description: {
      nl: "Codes zijn verstopt op locatie. Vind ze en voer ze in.",
      en: "Codes are hidden on site. Find them and enter them.",
    },
    points: 40,
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
      nl: "Hoeveel 3X3 Leaders zijn er dit jaar opgeleid via 3X3 Unites Academy?",
      en: "How many 3X3 Leaders graduated from the 3X3 Unites Academy this year?",
    },
    points: 30,
    accent: "blue",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Hoeveel 3X3 Leaders zijn er dit jaar opgeleid?",
          en: "How many 3X3 Leaders graduated this year?",
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
    title: { nl: "3X3 Leader exhibition quiz", en: "3X3 Leader exhibition quiz" },
    description: {
      nl: "Welke 3X3 Leader staat op het 3X3 Leader exhibition artwork?",
      en: "Which 3X3 Leader is on the 3X3 Leader exhibition artwork?",
    },
    points: 25,
    accent: "blue",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Welke 3X3 Leader staat op het 3X3 Leader exhibition artwork?",
          en: "Which 3X3 Leader is on the 3X3 Leader exhibition artwork?",
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
          { nl: "Welcome to the festival", en: "Welcome to the festival" },
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
      nl: "De Interactive Dome heeft een speciale activiteit voor NXT LVL deelnemers.",
      en: "The Interactive Dome has a special activity for NXT LVL participants.",
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
  {
    id: "ch-shon-price",
    type: "panna_qr",
    title: { nl: "The Paint Wall", en: "The Paint Wall" },
    description: {
      nl: "Draag bij aan The Paint Wall — geschilderd door Shon Price — en krijg de code van de crew.",
      en: "Contribute to The Paint Wall — painted by Shon Price — and get the code from the crew.",
    },
    points: 50,
    accent: "green",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Code bij het artwork.", en: "Code at the artwork." },
        qrCode: "SIDE-SHON-01",
      },
    },
  },
  {
    id: "ch-go-drip",
    type: "panna_qr",
    title: { nl: "Go Drip", en: "Go Drip" },
    description: {
      nl: "Meld je aan voor de kledingdonatie-actie Go Drip.",
      en: "Sign up for the Go Drip clothes donation action.",
    },
    points: 40,
    accent: "green",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Inschrijfbalie Go Drip.", en: "Go Drip signup desk." },
        qrCode: "SIDE-DRIP-01",
      },
    },
  },
  {
    id: "ch-barbershop",
    type: "panna_qr",
    title: { nl: "Triple Threat Barbershop", en: "Triple Threat Barbershop" },
    description: {
      nl: "Gratis knipbeurt bij Triple Threat — code van de barber.",
      en: "Free cut at Triple Threat — code from the barber.",
    },
    points: 50,
    accent: "orange",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Na je cut.", en: "After your cut." },
        qrCode: "SIDE-BARBER-01",
      },
    },
  },
  {
    id: "ch-talent-movement",
    type: "panna_qr",
    title: { nl: "Talent Movement bus", en: "Talent Movement bus" },
    description: {
      nl: "Maak een beat/song bij de Talent Movement bus.",
      en: "Create a beat/song at the Talent Movement bus.",
    },
    points: 50,
    accent: "blue",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Code na je track.", en: "Code after your track." },
        qrCode: "SIDE-TALENT-01",
      },
    },
  },
  {
    id: "ch-vriendenloterij",
    type: "trivia",
    title: { nl: "Vriendenloterij quiz", en: "Friends Lottery quiz" },
    description: {
      nl: "Sport-trivia bij de locker rooms — 3 juiste antwoorden.",
      en: "Sports trivia at the locker rooms — 3 correct answers.",
    },
    points: 40,
    accent: "blue",
    payload: {
      type: "trivia",
      data: {
        question: {
          nl: "Hoeveel spelers staan er per team op het veld in 3x3?",
          en: "How many players per team are on court in 3x3?",
        },
        options: [{ nl: "3", en: "3" }, { nl: "4", en: "4" }, { nl: "5", en: "5" }],
        correctIndex: 0,
      },
    },
  },
  {
    id: "ch-nxt-level",
    type: "panna_qr",
    title: { nl: "nxt level food station", en: "nxt level food station" },
    description: {
      nl: "Haal een verse sportdrank bij de nxt level food station.",
      en: "Collect a fresh sports drink at the nxt level food station.",
    },
    points: 30,
    accent: "green",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Bij de food station.", en: "At the food station." },
        qrCode: "SIDE-NXT-01",
      },
    },
  },
  {
    id: "ch-skills-showdown",
    type: "panna_qr",
    title: { nl: "3X3 Skills Showdown", en: "3X3 Skills Showdown" },
    description: {
      nl: "Doe mee en ontvang je player card.",
      en: "Participate and receive your player card.",
    },
    points: 50,
    accent: "orange",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Na je run.", en: "After your run." },
        qrCode: "SIDE-SKILLS-01",
      },
    },
  },
  {
    id: "ch-leader-hub-side",
    type: "panna_qr",
    title: { nl: "3X3 Leader Hub storytelling", en: "3X3 Leader Hub storytelling" },
    description: {
      nl: "Meld je aan voor meer over 3X3 Unites leader storytelling.",
      en: "Sign up to hear more about 3X3 Unites leader storytelling.",
    },
    points: 25,
    accent: "blue",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "3X3 Leader Hub desk.", en: "3X3 Leader Hub desk." },
        qrCode: "SIDE-LEADER-HUB",
      },
    },
  },
  {
    id: "ch-arcade",
    type: "panna_qr",
    title: { nl: "Retro arcade", en: "Retro arcade" },
    description: {
      nl: "Speel een old-school arcade game in de dome.",
      en: "Play an old-school arcade game in the dome.",
    },
    points: 30,
    accent: "green",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Na je game.", en: "After your game." },
        qrCode: "SIDE-ARCADE-01",
      },
    },
  },
  {
    id: "ch-shooting-record",
    type: "panna_qr",
    title: { nl: "Shooting arcade record", en: "Shooting arcade record" },
    description: {
      nl: "Probeer het record te breken bij de basketball shooting game bij RaboBank Court.",
      en: "Try to break the record at the basketball shooting game at RaboBank Court.",
    },
    points: 40,
    accent: "orange",
    payload: {
      type: "panna_qr",
      data: {
        hint: { nl: "Scorebord booth.", en: "Scoreboard booth." },
        qrCode: "SIDE-SHOOT-01",
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
      nl: "5 main quests voltooid.",
      en: "5 main quests completed.",
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
      nl: "Alle main quests voltooid. Grand tour klaar!",
      en: "All main quests completed. Grand tour done!",
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
      nl: "Foto geüpload naar de Worthy de Jong selfie contest.",
      en: "Uploaded a photo to the Worthy de Jong selfie contest.",
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
    id: "rw-merch-20-off",
    name: { nl: "20% korting Unites merch", en: "20% off Unites merch" },
    description: {
      nl: "20% korting in de Unites merch store op het terrein — alleen vandaag, alleen fysiek in de winkel.",
      en: "20% off at the Unites merch store on site — today only, in-store redemption only.",
    },
    type: "merch_voucher",
    verifiable: false,
    costPoints: 30,
    stock: 100,
    emoji: "🏷️",
    accent: "green",
  },
  {
    id: "rw-merch-pack",
    name: { nl: "Merch voucher", en: "Merch voucher" },
    description: {
      nl: "Keychain, armband of sticker — kies één item bij de reward desk.",
      en: "Keychain, bracelet or sticker — pick one item at the reward desk.",
    },
    type: "merch_voucher",
    verifiable: false,
    costPoints: 40,
    stock: 50,
    emoji: "🎁",
    accent: "orange",
  },
  {
    id: "rw-food-voucher",
    name: { nl: "Food voucher", en: "Food voucher" },
    description: {
      nl: "Maaltijd bij de food trucks. Vraag op locatie naar de vrienden-loterij.",
      en: "Meal at the food trucks. Ask on site about the friends lottery.",
    },
    type: "food",
    verifiable: false,
    costPoints: 60,
    stock: 40,
    emoji: "🍔",
    accent: "green",
  },
  {
    id: "rw-water-bottle",
    name: { nl: "3x3 waterfles", en: "3x3 water bottle" },
    description: {
      nl: "Officiële 3x3 Unites waterfles — ophalen bij de reward desk.",
      en: "Official 3x3 Unites water bottle — collect at the reward desk.",
    },
    type: "water",
    verifiable: true,
    costPoints: 180,
    stock: 20,
    emoji: "💧",
    accent: "blue",
  },
  {
    id: "rw-3x3-ball",
    name: { nl: "3x3 bal", en: "3x3 ball" },
    description: {
      nl: "Officiële 3x3 streetball — ophalen bij de reward desk (beperkte voorraad).",
      en: "Official 3x3 streetball — collect at the reward desk (limited stock).",
    },
    type: "ball",
    verifiable: true,
    costPoints: 250,
    stock: 6,
    emoji: "🏀",
    accent: "orange",
  },
  {
    id: "rw-airpods-case",
    name: { nl: "AirPods case", en: "AirPods case" },
    description: {
      nl: "Case voor AirPods (4e gen.) — ophalen bij de reward desk.",
      en: "AirPods case (4th gen.) — collect at the reward desk.",
    },
    type: "airpods_case",
    verifiable: true,
    costPoints: 300,
    stock: 12,
    emoji: "🎧",
    accent: "blue",
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
    const count = Math.max(
      0,
      Math.min(SEED_JOURNEY_STEPS.length, Math.floor((30 - idx) / 3))
    );
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
  "Welcome to the festival",
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

export const SEED_WHEEL_PRIZES: WheelPrize[] = [
  {
    id: "wp-water",
    label: { nl: "Gratis water", en: "Free water" },
    emoji: "💧",
    weight: 28,
  },
  {
    id: "wp-snack",
    label: { nl: "Snack voucher", en: "Snack voucher" },
    emoji: "🍔",
    weight: 24,
  },
  {
    id: "wp-merch-10",
    label: { nl: "10% merch korting", en: "10% merch discount" },
    emoji: "🧢",
    weight: 20,
  },
  {
    id: "wp-sticker",
    label: { nl: "Sticker pack", en: "Sticker pack" },
    emoji: "⭐",
    weight: 15,
  },
  {
    id: "wp-spin-again",
    label: { nl: "Nog een spin!", en: "Spin again!" },
    emoji: "🔄",
    weight: 8,
  },
  {
    id: "wp-food",
    label: { nl: "Food voucher", en: "Food voucher" },
    emoji: "🎁",
    weight: 5,
  },
];

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
