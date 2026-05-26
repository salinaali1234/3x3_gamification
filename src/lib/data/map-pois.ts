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
  /** Position on the plattegrond image (0–100 %) */
  x: number;
  y: number;
  /** Journey or challenge code shown at this location, if any */
  redeemCode?: string;
};

export const FESTIVAL_MAP_POIS: MapPoi[] = [
  {
    id: "poi-leader-hub",
    mapCode: "LEADER",
    name: { nl: "Leader Hub", en: "Leader Hub" },
    description: {
      nl: "Leader Hub — laatste main quest. Beschikbaar zodra alle andere quests klaar zijn.",
      en: "Leader Hub — final main quest. Unlocks once all others are done.",
    },
    category: "activation",
    x: 58,
    y: 32,
    redeemCode: "JOURNEY-LEADER",
  },
  {
    id: "poi-rabobank-bus",
    mapCode: "RABO-BUS",
    name: { nl: "Rabo Bus", en: "Rabo Bus" },
    description: {
      nl: "De Rabo Bus — main quest #1.",
      en: "The Rabo Bus — main quest #1.",
    },
    category: "activation",
    x: 72,
    y: 38,
    redeemCode: "JOURNEY-RABO",
  },
  {
    id: "poi-ingang",
    mapCode: "INGANG",
    name: { nl: "Ingang", en: "Entrance" },
    description: {
      nl: "Hoofdingang van het festivalterrein.",
      en: "Main entrance to the festival grounds.",
    },
    category: "service",
    x: 88,
    y: 88,
  },
  {
    id: "poi-court-black",
    mapCode: "STREETS",
    name: { nl: "The Streets: KFC court", en: "The Streets: KFC court" },
    description: {
      nl: "The Streets — main quest. Speel een minuut en voer de code in.",
      en: "The Streets — main quest. Play a minute and enter the code.",
    },
    category: "court",
    x: 22,
    y: 68,
    redeemCode: "JOURNEY-STREETS",
  },
  {
    id: "poi-merch",
    mapCode: "MERCH",
    name: { nl: "Merch zone (side event)", en: "Merch zone (side event)" },
    description: {
      nl: "Merchandise drop — side event, geen main quest.",
      en: "Merchandise drop — side event, not a main quest.",
    },
    category: "activation",
    x: 18,
    y: 48,
  },
  {
    id: "poi-court-3x3",
    mapCode: "COURT-3X3",
    name: { nl: "3x3 Unites Courts", en: "3x3 Unites Courts" },
    description: {
      nl: "Vier 3x3 basketball courts bovenaan het terrein.",
      en: "Four 3x3 basketball courts at the top of the site.",
    },
    category: "court",
    x: 38,
    y: 14,
    redeemCode: "JOURNEY-PRACTICE",
  },
  {
    id: "poi-dome",
    mapCode: "DOME",
    name: { nl: "Dome / NXT Level", en: "Dome / NXT Level" },
    description: {
      nl: "Geodesic dome — main quest.",
      en: "Geodesic dome — main quest.",
    },
    category: "activation",
    x: 42,
    y: 28,
    redeemCode: "JOURNEY-DOME",
  },
  {
    id: "poi-dj",
    mapCode: "DJ",
    name: { nl: "DJ Booth", en: "DJ Booth" },
    description: {
      nl: "DJ booth — side challenges (live poll).",
      en: "DJ booth — side challenges (live poll).",
    },
    category: "entertainment",
    x: 78,
    y: 78,
  },
  {
    id: "poi-hekken",
    mapCode: "HEKKEN",
    name: { nl: "Hekken installatie", en: "Fence installation" },
    description: {
      nl: "Kunstinstallatie — main quest.",
      en: "Art installation — main quest.",
    },
    category: "culture",
    x: 50,
    y: 52,
    redeemCode: "JOURNEY-HEKKEN",
  },
  {
    id: "poi-food",
    mapCode: "FOOD",
    name: { nl: "Food", en: "Food" },
    description: {
      nl: "Food trucks en eetplek.",
      en: "Food trucks and dining area.",
    },
    category: "food",
    x: 48,
    y: 82,
  },
  {
    id: "poi-panna",
    mapCode: "PANNA",
    name: { nl: "Panna cages", en: "Panna cages" },
    description: {
      nl: "Drie panna voetbalcages bij de kids area.",
      en: "Three panna football cages near the kids area.",
    },
    category: "court",
    x: 72,
    y: 72,
    redeemCode: "PANNA-HIDDEN-01",
  },
  {
    id: "poi-bar",
    mapCode: "BAR",
    name: { nl: "Bar", en: "Bar" },
    description: {
      nl: "Bar bij de Rabobank container.",
      en: "Bar next to the Rabobank container.",
    },
    category: "food",
    x: 55,
    y: 42,
  },
  {
    id: "poi-toiletten",
    mapCode: "WC",
    name: { nl: "Toiletten", en: "Toilets" },
    description: {
      nl: "Toiletblokken langs de rechterrand.",
      en: "Toilet blocks along the right edge.",
    },
    category: "service",
    x: 90,
    y: 22,
  },
  {
    id: "poi-ehbo",
    mapCode: "EHBO",
    name: { nl: "EHBO", en: "First aid" },
    description: {
      nl: "Eerste hulp linksonder bij de bomen.",
      en: "First aid at the bottom left near the trees.",
    },
    category: "service",
    x: 12,
    y: 88,
  },
  {
    id: "poi-kids",
    mapCode: "KIDS",
    name: { nl: "Kids / Painting", en: "Kids / Painting" },
    description: {
      nl: "Kids area — loop achter de T-vorm en schilder zelf iets op de muur.",
      en: "Kids area — walk behind the T-shape and paint something on the wall yourself.",
    },
    category: "entertainment",
    x: 82,
    y: 62,
    redeemCode: "JOURNEY-PAINT",
  },
  {
    id: "poi-cultuur",
    mapCode: "CULTUUR",
    name: { nl: "Cultuur Bus", en: "Culture Bus" },
    description: {
      nl: "Cultuur Bus in het Cultuur Dorp — main quest.",
      en: "Culture Bus in the Culture Village — main quest.",
    },
    category: "culture",
    x: 14,
    y: 78,
    redeemCode: "JOURNEY-CULTUUR",
  },
  {
    id: "poi-tribunes",
    mapCode: "TRIB",
    name: { nl: "Kantel tribunes", en: "Tilt stands" },
    description: {
      nl: "Mobiele tribunes langs de 3x3 courts.",
      en: "Mobile stands along the 3x3 courts.",
    },
    category: "service",
    x: 8,
    y: 22,
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
