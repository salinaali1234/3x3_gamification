import { FESTIVAL_MAP_ASPECT, FESTIVAL_MAP_IMAGE } from "@/lib/data/map-pois";
import { cn } from "@/lib/utils";

type FestivalMapEmbedProps = {
  title: string;
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
};

/** Official venue map (`venue-map.png` from `map 3x3 festival.pdf`) with overlay markers. */
export function FestivalMapEmbed({
  title,
  className,
  innerClassName,
  children,
}: FestivalMapEmbedProps) {
  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio: FESTIVAL_MAP_ASPECT }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FESTIVAL_MAP_IMAGE}
        alt={title}
        className={cn("absolute inset-0 h-full w-full object-contain bg-black", innerClassName)}
        draggable={false}
      />
      {children}
    </div>
  );
}
