"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  FESTIVAL_MAP_POIS,
  FESTIVAL_MAP_PDF,
} from "@/lib/data/map-pois";
import { FestivalMapEmbed } from "@/components/festival-map-embed";

/** Main quest POIs on the homepage preview */

export function HomeMapPreview({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const mainQuestPois = FESTIVAL_MAP_POIS.filter((p) => p.redeemCode?.startsWith("JOURNEY-"));

  return (
    <section
      id="festival-map"
      className="border-b border-white/10 bg-brand-offwhite text-brand-black scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="brand-section-label !text-brand-black/50 mb-2">
              {dict.map.sectionLabel}
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-brand-black">
              {dict.map.homeTitle}
            </h2>
            <p className="mt-2 text-brand-black/70 max-w-xl text-sm sm:text-base">
              {dict.map.homeSubtitle}
            </p>
          </div>
          <Link
            href="/map"
            className="shrink-0 text-sm font-mono uppercase tracking-wider text-brand-black/60 hover:text-brand-black"
          >
            {dict.map.openFullMap} →
          </Link>
        </div>

        <div className="relative rounded-lg border border-black/10 overflow-hidden bg-white shadow-lg">
          <FestivalMapEmbed
            title={dict.map.imageAlt}
            className="max-h-[480px]"
          >
            {mainQuestPois.map((poi) => (
              <Link
                key={poi.id}
                href={`/map?poi=${poi.id}`}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-brand-black bg-brand-orange hover:scale-125 transition-transform"
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                title={poi.name[locale]}
                aria-label={poi.name[locale]}
              />
            ))}
          </FestivalMapEmbed>
        </div>
        <p className="mt-3 text-xs text-brand-black/50 font-mono">
          {dict.map.mainQuestHint}{" "}
          <a
            href={FESTIVAL_MAP_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-black/70 hover:text-brand-black underline underline-offset-2"
          >
            {dict.map.openPdf}
          </a>
        </p>
      </div>
    </section>
  );
}
