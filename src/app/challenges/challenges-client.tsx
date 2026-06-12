"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type {
  UnifiedChallenge,
  PrizeTier,
  DayFlag,
} from "@/lib/data/challenges-v2";

type Group = { location: string; challenges: UnifiedChallenge[] };

export type ChallengesClientProps = {
  groups: Group[];
  completedIds: string[];
  initialPoints: number;
  tiers: PrizeTier[];
  currentDay: DayFlag | "sunday" | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "ok"; pointsAwarded: number }
  | { kind: "error"; message: string };

const errorMessages: Record<string, string> = {
  invalid_challenge: "Challenge not found.",
  already_completed: "You've already completed this challenge.",
  wrong_code: "That code isn't right — double-check with the 3X3 Leader.",
  wrong_letters: "Those letters don't form the secret word. Try again.",
  code_required: "Enter the code from the 3X3 Leader.",
  letters_required: "Enter all 10 letters.",
  not_logged_in: "Please log in to play.",
  network: "Something went wrong. Try again.",
};

export function ChallengesClient({
  groups,
  completedIds: initialCompleted,
  initialPoints,
  tiers,
  currentDay,
}: ChallengesClientProps) {
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompleted)
  );
  const [points, setPoints] = useState(initialPoints);

  function onComplete(id: string, awarded: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPoints((p) => p + awarded);
  }

  const totals = useMemo(() => {
    const totalChallenges = groups.reduce((s, g) => s + g.challenges.length, 0);
    return { totalChallenges, done: completed.size };
  }, [groups, completed]);

  const nextTier = useMemo(() => {
    return tiers.find((t) => t.costPoints > points) ?? null;
  }, [tiers, points]);

  return (
    <div className="space-y-12">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10">
        <Stat label="Your points" value={points.toString()} accent="green" />
        <Stat
          label="Challenges done"
          value={`${totals.done} / ${totals.totalChallenges}`}
          accent="orange"
        />
        <Stat
          label="Next prize at"
          value={nextTier ? `${nextTier.costPoints} pts` : "Maxed!"}
          accent="blue"
        />
        <Stat
          label="Festival day"
          value={
            currentDay === "friday"
              ? "Friday"
              : currentDay === "saturday"
                ? "Saturday"
                : currentDay === "sunday"
                  ? "Sunday"
                  : "—"
          }
          accent="green"
        />
      </div>

      {groups.map((group) => (
        <section key={group.location}>
          <div className="brand-section-label mb-3">{group.location}</div>
          <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent mb-6" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                done={completed.has(c.id)}
                currentDay={currentDay}
                onCompleted={(awarded) => onComplete(c.id, awarded)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "green" | "orange" | "blue";
}) {
  const accentText = {
    green: "text-brand-green",
    orange: "text-brand-orange",
    blue: "text-brand-blue",
  }[accent];
  return (
    <div className="bg-brand-black px-4 py-5">
      <div className={cn("font-display text-3xl sm:text-4xl tabular-nums", accentText)}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white/55">
        {label}
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  done,
  currentDay,
  onCompleted,
}: {
  challenge: UnifiedChallenge;
  done: boolean;
  currentDay: DayFlag | "sunday" | null;
  onCompleted: (pointsAwarded: number) => void;
}) {
  const accent = challenge.accent;
  const accentText = {
    green: "text-brand-green",
    orange: "text-brand-orange",
    blue: "text-brand-blue",
  }[accent];
  const accentBg = {
    green: "bg-brand-green",
    orange: "bg-brand-orange",
    blue: "bg-brand-blue",
  }[accent];
  const accentBorder = {
    green: "border-brand-green/40",
    orange: "border-brand-orange/40",
    blue: "border-brand-blue/40",
  }[accent];

  const unavailableForToday =
    !!challenge.dayFlag && currentDay !== null && currentDay !== challenge.dayFlag;

  const dayScheduleLabel =
    challenge.dayFlag && challenge.schedule
      ? `${challenge.dayFlag === "friday" ? "Fri" : "Sat"} ${challenge.schedule.startTime}–${challenge.schedule.endTime}`
      : challenge.dayFlag
        ? challenge.dayFlag === "friday"
          ? "Friday only"
          : "Saturday only"
        : null;

  return (
    <article
      id={`challenge-${challenge.id}`}
      className={cn(
        "relative rounded-md border bg-white/[0.02] p-5 flex flex-col gap-3 transition-colors",
        done ? "border-brand-green/40 bg-brand-green/[0.04]" : "border-white/10",
        unavailableForToday && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-block px-2 py-0.5 brand-section-label rounded-sm border",
              accentBorder,
              accentText
            )}
          >
            {challenge.verification === "code"
              ? "Code"
              : challenge.verification === "fence"
                ? "Secret word"
                : challenge.verification === "photo"
                  ? "Photo"
                  : "Mark done"}
          </span>
          {dayScheduleLabel ? (
            <span
              className={cn(
                "inline-block px-2 py-0.5 brand-section-label rounded-sm border border-white/20",
                unavailableForToday ? "text-white/40" : "text-white/70"
              )}
            >
              {dayScheduleLabel}
            </span>
          ) : null}
        </div>
        <div className={cn("font-display text-2xl tabular-nums", accentText)}>
          +{challenge.points}
        </div>
      </div>

      <h3 className="font-display text-2xl sm:text-3xl leading-tight uppercase">
        {challenge.title}
      </h3>
      <p className="text-sm text-white/80 leading-snug">{challenge.subtitle}</p>
      <p className="text-sm text-white/50 leading-relaxed">{challenge.description}</p>

      <div className="mt-auto pt-2">
        {done ? (
          <div className="flex items-center gap-2 text-brand-green">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-brand-black text-xs font-bold",
                accentBg
              )}
              aria-hidden
            >
              ✓
            </span>
            <span className="brand-section-label !text-brand-green">
              Completed · +{challenge.points} pts
            </span>
          </div>
        ) : unavailableForToday ? (
          <p className="text-xs text-white/50">
            {challenge.schedule
              ? `Available ${challenge.dayFlag === "friday" ? "Friday" : "Saturday"} ${challenge.schedule.startTime}–${challenge.schedule.endTime} only.`
              : `Available on ${challenge.dayFlag === "friday" ? "Friday" : "Saturday"} only.`}
          </p>
        ) : challenge.verification === "code" ? (
          <CodeForm challengeId={challenge.id} onCompleted={onCompleted} accent={accent} />
        ) : challenge.verification === "fence" ? (
          <FenceForm
            challengeId={challenge.id}
            letterCount={challenge.letters?.length ?? 10}
            onCompleted={onCompleted}
            accent={accent}
          />
        ) : challenge.verification === "photo" ? (
          <PhotoForm challengeId={challenge.id} onCompleted={onCompleted} accent={accent} />
        ) : (
          <ManualForm challengeId={challenge.id} onCompleted={onCompleted} accent={accent} />
        )}
      </div>
    </article>
  );
}

async function postComplete(body: Record<string, unknown>) {
  const res = await fetch("/api/challenges-v2/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as
    | { ok: true; pointsAwarded: number }
    | { ok: false; error: string };
}

function CodeForm({
  challengeId,
  onCompleted,
  accent,
}: {
  challengeId: string;
  onCompleted: (n: number) => void;
  accent: "green" | "orange" | "blue";
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await postComplete({ challengeId, code });
      if (res.ok) {
        setStatus({ kind: "ok", pointsAwarded: res.pointsAwarded });
        onCompleted(res.pointsAwarded);
      } else {
        setStatus({
          kind: "error",
          message: errorMessages[res.error] ?? errorMessages.network,
        });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code from 3X3 Leader"
          className="flex-1 min-w-0 rounded border border-white/15 bg-brand-black/60 px-3 py-2 text-sm font-mono uppercase tracking-wider placeholder:text-white/30 focus:border-brand-green focus:outline-none"
          aria-label="Code from 3X3 Leader"
        />
        <SubmitButton accent={accent} disabled={isPending || !code.trim()}>
          {isPending ? "…" : "Submit"}
        </SubmitButton>
      </div>
      <StatusLine status={status} />
    </form>
  );
}

function FenceForm({
  challengeId,
  letterCount,
  onCompleted,
  accent,
}: {
  challengeId: string;
  letterCount: number;
  onCompleted: (n: number) => void;
  accent: "green" | "orange" | "blue";
}) {
  const [letters, setLetters] = useState<string[]>(
    () => Array.from({ length: letterCount }, () => "")
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function setLetter(i: number, v: string) {
    setLetters((prev) => {
      const next = [...prev];
      next[i] = v.slice(-1).toUpperCase();
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (letters.some((l) => !l)) {
      setStatus({ kind: "error", message: errorMessages.letters_required });
      return;
    }
    startTransition(async () => {
      const res = await postComplete({ challengeId, letters });
      if (res.ok) {
        setStatus({ kind: "ok", pointsAwarded: res.pointsAwarded });
        onCompleted(res.pointsAwarded);
      } else {
        setStatus({
          kind: "error",
          message: errorMessages[res.error] ?? errorMessages.network,
        });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-[11px] uppercase tracking-widest text-white/55 font-mono">
        Enter the {letterCount} letters in the correct order
      </p>
      <div className="flex flex-wrap gap-1.5">
        {letters.map((l, i) => (
          <input
            key={i}
            type="text"
            inputMode="text"
            autoComplete="off"
            value={l}
            onChange={(e) => setLetter(i, e.target.value)}
            maxLength={1}
            aria-label={`Letter ${i + 1}`}
            className="h-10 w-8 text-center font-display text-xl uppercase rounded border border-white/15 bg-brand-black/60 focus:border-brand-orange focus:outline-none"
          />
        ))}
      </div>
      <SubmitButton accent={accent} disabled={isPending}>
        {isPending ? "Checking…" : "Reveal reward"}
      </SubmitButton>
      <StatusLine status={status} />
    </form>
  );
}

function ManualForm({
  challengeId,
  onCompleted,
  accent,
}: {
  challengeId: string;
  onCompleted: (n: number) => void;
  accent: "green" | "orange" | "blue";
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await postComplete({ challengeId });
      if (res.ok) {
        setStatus({ kind: "ok", pointsAwarded: res.pointsAwarded });
        onCompleted(res.pointsAwarded);
      } else {
        setStatus({
          kind: "error",
          message: errorMessages[res.error] ?? errorMessages.network,
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className={cn(
          "group flex items-center gap-2 rounded border border-white/15 bg-white/[0.03] px-3 py-2 text-sm hover:border-white/30 transition-colors disabled:opacity-50",
          accent === "green" && "hover:border-brand-green",
          accent === "orange" && "hover:border-brand-orange",
          accent === "blue" && "hover:border-brand-blue"
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-white/30 group-hover:border-white/60">
          {isPending ? <span className="text-xs">…</span> : null}
        </span>
        <span className="font-mono uppercase text-[11px] tracking-widest">
          {isPending ? "Marking…" : "Mark as done"}
        </span>
      </button>
      <StatusLine status={status} />
    </div>
  );
}

function PhotoForm({
  challengeId,
  onCompleted,
  accent,
}: {
  challengeId: string;
  onCompleted: (n: number) => void;
  accent: "green" | "orange" | "blue";
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  // Photo upload wiring is intentionally minimal for the mockup.
  // Once Supabase storage is wired, replace this with a real upload.

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await postComplete({ challengeId, photo: true });
      if (res.ok) {
        setStatus({ kind: "ok", pointsAwarded: res.pointsAwarded });
        onCompleted(res.pointsAwarded);
      } else {
        setStatus({
          kind: "error",
          message: errorMessages[res.error] ?? errorMessages.network,
        });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="text-[11px] uppercase tracking-widest text-white/55 font-mono">
        Upload your photo
      </label>
      <input
        type="file"
        accept="image/*"
        className="text-xs file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-white hover:file:bg-white/20"
      />
      <SubmitButton accent={accent} disabled={isPending}>
        {isPending ? "Uploading…" : "Submit photo"}
      </SubmitButton>
      <StatusLine status={status} />
    </form>
  );
}

function SubmitButton({
  accent,
  disabled,
  children,
}: {
  accent: "green" | "orange" | "blue";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const accentBg = {
    green: "bg-brand-green",
    orange: "bg-brand-orange",
    blue: "bg-brand-blue",
  }[accent];
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] px-3 py-2 text-brand-black transition-opacity disabled:opacity-50",
        accentBg
      )}
    >
      {children}
    </button>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  if (status.kind === "ok") {
    return (
      <p className="text-xs text-brand-green font-mono">
        Done · +{status.pointsAwarded} pts
      </p>
    );
  }
  return <p className="text-xs text-brand-orange">{status.message}</p>;
}
