import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function accentClass(
  accent: "green" | "orange" | "blue",
  mode: "bg" | "text" | "border" | "ring" = "bg"
): string {
  const map = {
    green: {
      bg: "bg-brand-green",
      text: "text-brand-green",
      border: "border-brand-green",
      ring: "ring-brand-green",
    },
    orange: {
      bg: "bg-brand-orange",
      text: "text-brand-orange",
      border: "border-brand-orange",
      ring: "ring-brand-orange",
    },
    blue: {
      bg: "bg-brand-blue",
      text: "text-brand-blue",
      border: "border-brand-blue",
      ring: "ring-brand-blue",
    },
  } as const;
  return map[accent][mode];
}

export function accentTextOn(accent: "green" | "orange" | "blue"): string {
  return accent === "blue" ? "text-brand-black" : "text-brand-black";
}

export function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

export function generateVoucherCode(): string {
  return Array.from({ length: 3 }, () =>
    Math.random().toString(36).slice(2, 6).toUpperCase()
  ).join("-");
}

const PICKUP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateWheelPickupCode(): string {
  let part = "";
  for (let i = 0; i < 6; i++) {
    part += PICKUP_ALPHABET[Math.floor(Math.random() * PICKUP_ALPHABET.length)];
  }
  return `WHEEL-${part}`;
}
