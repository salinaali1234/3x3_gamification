"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  FESTIVAL_MAP_POIS,
  searchMapPois,
  type MapPoi,
  type MapPoiCategory,
} from "@/lib/data/map-pois";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<MapPoiCategory, string> = {
  court: "bg-brand-orange",
  food: "bg-brand-green",
  service: "bg-white/80",
  activation: "bg-brand-blue",
  culture: "bg-purple-500",
  entertainment: "bg-pink-500",
};

export function MapClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => searchMapPois(query), [query]);
  const selected =
    FESTIVAL_MAP_POIS.find((p) => p.id === selectedId) ?? results[0] ?? null;

  function selectPoi(poi: MapPoi) {
    setSelectedId(poi.id);
    setQuery(poi.mapCode);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="relative rounded-md border border-white/15 overflow-hidden bg-white">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/festival-map.png"
            alt={dict.map.imageAlt}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
            style={{ left: "88%", top: "88%" }}
          >
            <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-black shadow-md">
              {dict.map.youAreHere}
            </span>
            <span className="h-3 w-3 rounded-full border-2 border-brand-black bg-brand-green" />
          </div>
          {FESTIVAL_MAP_POIS.map((poi) => {
            const active = selected?.id === poi.id;
            const visible = results.some((r) => r.id === poi.id);
            if (!visible) return null;
            return (
              <button
                key={poi.id}
                type="button"
                onClick={() => selectPoi(poi)}
                className={cn(
                  "absolute z-10 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full transition-all",
                  active ? "scale-110" : "hover:scale-110"
                )}
                style={{
                  left: `${poi.x}%`,
                  top: `${poi.y}%`,
                  minWidth: "44px",
                  minHeight: "44px",
                }}
                title={poi.name[locale]}
                aria-label={poi.name[locale]}
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "block rounded-full border-2 border-brand-black",
                    poi.isMainQuest ? "bg-brand-orange" : CATEGORY_COLORS[poi.category],
                    active ? "h-6 w-6 ring-4 ring-brand-green" : "h-4 w-4 opacity-90"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <div>
          <label className="brand-section-label">{dict.map.searchLabel}</label>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedId(null);
            }}
            placeholder={dict.map.searchPlaceholder}
            className="mt-2 w-full rounded border border-white/15 bg-brand-black px-3 py-2 text-sm placeholder:text-white/30 focus:border-brand-green focus:outline-none"
          />
          <p className="mt-2 text-xs text-white/40">{dict.map.searchHint}</p>
        </div>

        {selected ? (
          <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-brand-green">
                {selected.mapCode}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-brand-black",
                  CATEGORY_COLORS[selected.category]
                )}
              >
                {dict.map.categories[selected.category]}
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl">{selected.name[locale]}</h3>
            <p className="mt-1 text-sm text-white/70">
              {selected.description[locale]}
            </p>
            {selected.redeemCode ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/50 font-mono">
                  {dict.map.journeyCode}: {selected.redeemCode}
                </p>
                <Link
                  href={`/challenges?code=${encodeURIComponent(selected.redeemCode)}`}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-green text-brand-black px-4 py-2 text-sm font-medium hover:bg-brand-green/90"
                >
                  {dict.map.enterCode} →
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <ul className="max-h-64 overflow-y-auto rounded-md border border-white/10 divide-y divide-white/5">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-sm text-white/50">{dict.map.noResults}</li>
          ) : (
            results.map((poi) => (
              <li key={poi.id}>
                <button
                  type="button"
                  onClick={() => selectPoi(poi)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm hover:bg-white/[0.04] transition-colors",
                    selected?.id === poi.id && "bg-brand-green/10"
                  )}
                >
                  <span className="font-mono text-xs text-white/40 mr-2">
                    {poi.mapCode}
                  </span>
                  <span className="text-brand-white">{poi.name[locale]}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}
