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
  /** Short code shown in search / sidebar */
  mapCode: string;
  /** Number on the official venue map legend (01–08) */
  siteNumber?: string;
  name: Bilingual;
  description: Bilingual;
  category: MapPoiCategory;
  /** Horizontal position on the map image (0–100%) */
  x: number;
  /** Vertical position on the map image (0–100%) */
  y: number;
  redeemCode?: string;
  isMainQuest?: boolean;
};

export const FESTIVAL_MAP_PDF = "/festival-map.pdf";
/** Render of `map 3x3 festival.pdf` — pins calibrated to this file */
export const FESTIVAL_MAP_IMAGE = "/venue-map.png";
export const FESTIVAL_MAP_ASPECT = "2400 / 1368";

export const FESTIVAL_MAP_POIS: MapPoi[] = [
  {
    id: "poi-ingang",
    mapCode: "ENTRANCE",
    name: { nl: "Entrance", en: "Entrance" },
    description: {
      nl: "Hoofdingang & tickets — start hier op het terrein.",
      en: "Main entrance & tickets — start here on site.",
    },
    category: "service",
    x: 83,
    y: 68,
  },
  {
    id: "poi-streets",
    mapCode: "03",
    siteNumber: "03",
    name: { nl: "Rabo 3x3 Street League", en: "Rabo 3x3 Street League" },
    description: {
      nl: "Street League courts — main quest (The Streets).",
      en: "Street League courts — main quest (The Streets).",
    },
    category: "court",
    x: 47,
    y: 21,
    redeemCode: "JOURNEY-STREETS",
    isMainQuest: true,
  },
  {
    id: "poi-odido-dome",
    mapCode: "04",
    siteNumber: "04",
    name: { nl: "Interactive Dome — powered by Odido", en: "Interactive Dome — powered by Odido" },
    description: {
      nl: "Talks, AI experience & rave — main quest (Interactive Dome — powered by Odido).",
      en: "Talks, AI experience & rave — main quest (Interactive Dome — powered by Odido).",
    },
    category: "activation",
    x: 44,
    y: 39,
    redeemCode: "JOURNEY-DOME",
    isMainQuest: true,
  },
  {
    id: "poi-rabobus",
    mapCode: "RABO",
    name: { nl: "RaboBank Court", en: "RaboBank Court" },
    description: {
      nl: "Stap de bus in bij RaboBank Court — main quest.",
      en: "Step inside the bus at RaboBank Court — main quest.",
    },
    category: "activation",
    x: 56,
    y: 26,
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
    x: 47,
    y: 52,
    redeemCode: "JOURNEY-FOOD",
    isMainQuest: true,
  },
  {
    id: "poi-community",
    mapCode: "08",
    siteNumber: "08",
    name: { nl: "Community Corner", en: "Community Corner" },
    description: {
      nl: "Sneakerness & partners — main quest.",
      en: "Sneakerness & partners — main quest.",
    },
    category: "activation",
    x: 35,
    y: 58,
    redeemCode: "JOURNEY-COMMUNITY",
    isMainQuest: true,
  },
  {
    id: "poi-panna",
    mapCode: "02",
    siteNumber: "02",
    name: { nl: "Panna Courts", en: "Panna Courts" },
    description: {
      nl: "Panna KO courts — main quest.",
      en: "Panna KO courts — main quest.",
    },
    category: "court",
    x: 67,
    y: 50,
    redeemCode: "JOURNEY-PANNA",
    isMainQuest: true,
  },
  {
    id: "poi-leader-center",
    mapCode: "05",
    siteNumber: "05",
    name: { nl: "3X3 Leader Centre", en: "3X3 Leader Centre" },
    description: {
      nl: "3X3 Leader Centre — clinics & Rembrandt 3X3 Leader course. Main quest.",
      en: "3X3 Leader Centre — clinics & Rembrandt 3X3 Leader course. Main quest.",
    },
    category: "activation",
    x: 34,
    y: 33,
    redeemCode: "JOURNEY-LEADER-CENTER",
    isMainQuest: true,
  },
  {
    id: "poi-warmup",
    mapCode: "07",
    siteNumber: "07",
    name: { nl: "Warm-up Court", en: "Warm-up Court" },
    description: {
      nl: "Watch the pros warm up — main quest.",
      en: "Watch the pros warm up — main quest.",
    },
    category: "court",
    x: 20,
    y: 47,
    redeemCode: "JOURNEY-WARMUP",
    isMainQuest: true,
  },
  {
    id: "poi-hekken",
    mapCode: "06",
    siteNumber: "06",
    name: { nl: "Merch / 3X3 Leader exhibition", en: "Merch / 3X3 Leader exhibition" },
    description: {
      nl: "Merch & 3X3 Leader exhibition — main quest.",
      en: "Merch & 3X3 Leader exhibition — main quest.",
    },
    category: "culture",
    x: 29,
    y: 33,
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
    x: 33,
    y: 40,
    redeemCode: "SIDE-LEADER-HUB",
  },
  {
    id: "poi-kids",
    mapCode: "KIDS",
    name: { nl: "Kids Area", en: "Kids Area" },
    description: {
      nl: "Kids challenges & activations — side quests.",
      en: "Kids challenges & activations — side quests.",
    },
    category: "entertainment",
    x: 61,
    y: 45,
  },
  {
    id: "poi-bar",
    mapCode: "BAR",
    name: { nl: "Bar", en: "Bar" },
    description: {
      nl: "Bar & big screens.",
      en: "Bar & big screens.",
    },
    category: "food",
    x: 52,
    y: 44,
  },
  {
    id: "poi-media",
    mapCode: "MEDIA",
    name: { nl: "Media", en: "Media" },
    description: {
      nl: "Media zone bij de entrance.",
      en: "Media zone near the entrance.",
    },
    category: "service",
    x: 74,
    y: 56,
  },
  {
    id: "poi-vip",
    mapCode: "VIP",
    name: { nl: "VIP", en: "VIP" },
    description: {
      nl: "VIP-terras naast het stadion.",
      en: "VIP terrace next to the stadium.",
    },
    category: "service",
    x: 11,
    y: 77,
  },
  {
    id: "poi-stadium",
    mapCode: "STADIUM",
    name: { nl: "Stadium", en: "Stadium" },
    description: {
      nl: "Hoofdstadion — World Tour wedstrijden.",
      en: "Main stadium — World Tour matches.",
    },
    category: "court",
    x: 13,
    y: 48,
  },
  {
    id: "poi-toiletten",
    mapCode: "WC",
    name: { nl: "Toiletten", en: "Toilets" },
    description: { nl: "Toiletblok", en: "Toilet block" },
    category: "service",
    x: 67,
    y: 30,
  },
  {
    id: "poi-ehbo",
    mapCode: "01",
    siteNumber: "01",
    name: { nl: "First Aid", en: "First Aid" },
    description: { nl: "EHBO / first aid", en: "First aid" },
    category: "service",
    x: 73,
    y: 42,
  },
];

export function getMapPoiByCode(code: string): MapPoi | undefined {
  const upper = code.trim().toUpperCase();
  return FESTIVAL_MAP_POIS.find(
    (p) =>
      p.mapCode.toUpperCase() === upper ||
      p.siteNumber === upper ||
      p.redeemCode?.toUpperCase() === upper
  );
}

export function searchMapPois(query: string): MapPoi[] {
  const q = query.trim().toLowerCase();
  if (!q) return FESTIVAL_MAP_POIS;
  return FESTIVAL_MAP_POIS.filter(
    (p) =>
      p.mapCode.toLowerCase().includes(q) ||
      p.siteNumber?.includes(q) ||
      p.name.nl.toLowerCase().includes(q) ||
      p.name.en.toLowerCase().includes(q) ||
      p.description.nl.toLowerCase().includes(q) ||
      p.description.en.toLowerCase().includes(q) ||
      p.redeemCode?.toLowerCase().includes(q)
  );
}
