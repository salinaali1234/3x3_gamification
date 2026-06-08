import type { Bilingual } from "./types";

export type MapPoiCategory =
  | "court"
  | "food"
  | "service"
  | "activation"
  | "culture"
  | "entertainment";

export type MapPoi = {
  id: string;
  mapCode: string;
  name: Bilingual;
  description: Bilingual;
  category: MapPoiCategory;
  x: number;
  y: number;
  redeemCode?: string;
  isMainQuest?: boolean;
};

export const FESTIVAL_MAP_POIS: MapPoi[] = [
  {
    id: "poi-ingang",
    mapCode: "INGANG",
    name: { nl: "Ingang", en: "Entrance" },
    description: {
      nl: "Hoofdingang — start hier je festival journey.",
      en: "Main entrance — start your festival journey here.",
    },
    category: "service",
    x: 88,
    y: 88,
  },
  {
    id: "poi-streets",
    mapCode: "STREETS",
    name: { nl: "The Streets", en: "The Streets" },
    description: {
      nl: "3x3 Street League courts — main quest (100 pts).",
      en: "3x3 Street League courts — main quest (100 pts).",
    },
    category: "court",
    x: 22,
    y: 68,
    redeemCode: "JOURNEY-STREETS",
    isMainQuest: true,
  },
  {
    id: "poi-odido-dome",
    mapCode: "DOME",
    name: { nl: "Dome", en: "Dome" },
    description: {
      nl: "Talks, AI experience & rave — main quest.",
      en: "Talks, AI experience & rave — main quest.",
    },
    category: "activation",
    x: 42,
    y: 28,
    redeemCode: "JOURNEY-DOME",
    isMainQuest: true,
  },
  {
    id: "poi-rabobus",
    mapCode: "RABO",
    name: { nl: "The Rabobus", en: "The Rabobus" },
    description: {
      nl: "Rabobank Bus — main quest.",
      en: "Rabobank Bus — main quest.",
    },
    category: "activation",
    x: 72,
    y: 38,
    redeemCode: "JOURNEY-RABO",
    isMainQuest: true,
  },
  {
    id: "poi-food",
    mapCode: "FOOD",
    name: { nl: "Food Court", en: "Food Court" },
    description: {
      nl: "Food Court — main quest.",
      en: "Food Court — main quest.",
    },
    category: "food",
    x: 48,
    y: 82,
    redeemCode: "JOURNEY-FOOD",
    isMainQuest: true,
  },
  {
    id: "poi-community",
    mapCode: "COMMUNITY",
    name: { nl: "Community Corner", en: "Community Corner" },
    description: {
      nl: "Sneakerness & partners — main quest + side quests.",
      en: "Sneakerness & partners — main quest + side quests.",
    },
    category: "activation",
    x: 18,
    y: 48,
    redeemCode: "JOURNEY-COMMUNITY",
    isMainQuest: true,
  },
  {
    id: "poi-panna",
    mapCode: "PANNA",
    name: { nl: "Panna KO", en: "Panna KO" },
    description: {
      nl: "Panna courts — main quest.",
      en: "Panna courts — main quest.",
    },
    category: "court",
    x: 72,
    y: 72,
    redeemCode: "JOURNEY-PANNA",
    isMainQuest: true,
  },
  {
    id: "poi-leader-center",
    mapCode: "LEADER-CTR",
    name: { nl: "3X3 Leader Centre", en: "3X3 Leader Centre" },
    description: {
      nl: "Clinics & Rembrandt 3X3 Leader course — main quest.",
      en: "Clinics & Rembrandt 3X3 Leader course — main quest.",
    },
    category: "activation",
    x: 58,
    y: 32,
    redeemCode: "JOURNEY-LEADER-CENTER",
    isMainQuest: true,
  },
  {
    id: "poi-warmup",
    mapCode: "WARMUP",
    name: { nl: "Warmup Court", en: "Warmup Court" },
    description: {
      nl: "Watch the pros warm up — main quest.",
      en: "Watch the pros warm up — main quest.",
    },
    category: "court",
    x: 38,
    y: 14,
    redeemCode: "JOURNEY-WARMUP",
    isMainQuest: true,
  },
  {
    id: "poi-hekken",
    mapCode: "HEKKEN",
    name: { nl: "Leader exhibition", en: "Leader exhibition" },
    description: {
      nl: "10 years 3X3 Unites — spot the 3X3 Leader at the Leader exhibition.",
      en: "10 years 3X3 Unites — spot the 3X3 Leader at the Leader exhibition.",
    },
    category: "culture",
    x: 50,
    y: 52,
    redeemCode: "JOURNEY-HEKKEN",
    isMainQuest: true,
  },
  {
    id: "poi-leader-hub",
    mapCode: "LEADER-HUB",
    name: { nl: "3X3 Leader Hub", en: "3X3 Leader Hub" },
    description: {
      nl: "Leader storytelling signup — side quest.",
      en: "Leader storytelling signup — side quest.",
    },
    category: "activation",
    x: 55,
    y: 36,
    redeemCode: "SIDE-LEADER-HUB",
  },
  {
    id: "poi-kids",
    mapCode: "KIDS",
    name: { nl: "Kids Area", en: "Kids Area" },
    description: {
      nl: "Kids challenges & The Paint Wall — side quests.",
      en: "Kids challenges & The Paint Wall — side quests.",
    },
    category: "entertainment",
    x: 82,
    y: 62,
  },
  {
    id: "poi-bar",
    mapCode: "BAR",
    name: { nl: "Big Screens / Bar", en: "Big Screens / Bar" },
    description: {
      nl: "Watch NL vs Sweden — pop-up side event.",
      en: "Watch NL vs Sweden — pop-up side event.",
    },
    category: "food",
    x: 55,
    y: 42,
  },
  {
    id: "poi-toiletten",
    mapCode: "WC",
    name: { nl: "Toiletten", en: "Toilets" },
    description: { nl: "Toiletblokken", en: "Toilet blocks" },
    category: "service",
    x: 90,
    y: 22,
  },
  {
    id: "poi-ehbo",
    mapCode: "EHBO",
    name: { nl: "EHBO", en: "First aid" },
    description: { nl: "Eerste hulp", en: "First aid" },
    category: "service",
    x: 12,
    y: 88,
  },
];

export function getMapPoiByCode(code: string): MapPoi | undefined {
  const upper = code.trim().toUpperCase();
  return FESTIVAL_MAP_POIS.find(
    (p) =>
      p.mapCode.toUpperCase() === upper ||
      p.redeemCode?.toUpperCase() === upper
  );
}

export function searchMapPois(query: string): MapPoi[] {
  const q = query.trim().toLowerCase();
  if (!q) return FESTIVAL_MAP_POIS;
  return FESTIVAL_MAP_POIS.filter(
    (p) =>
      p.mapCode.toLowerCase().includes(q) ||
      p.name.nl.toLowerCase().includes(q) ||
      p.name.en.toLowerCase().includes(q) ||
      p.description.nl.toLowerCase().includes(q) ||
      p.description.en.toLowerCase().includes(q) ||
      p.redeemCode?.toLowerCase().includes(q)
  );
}
