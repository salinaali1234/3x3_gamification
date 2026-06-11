import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AuthRequiredPanel({ dict }: { dict: Dictionary }) {
  return (
    <div className="mt-10 mx-auto max-w-xl rounded-md border border-brand-green/30 bg-brand-green/5 p-8 sm:p-12 text-center">
      <p className="font-display text-3xl sm:text-4xl uppercase leading-tight">
        {dict.authGate.title}
      </p>
      <p className="mt-4 text-white/70">{dict.authGate.body}</p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <ButtonLink href="/login?tab=register" variant="primary" size="lg">
          {dict.authGate.signUp}
        </ButtonLink>
        <ButtonLink href="/login" variant="outline" size="lg">
          {dict.authGate.logIn}
        </ButtonLink>
      </div>
    </div>
  );
}
