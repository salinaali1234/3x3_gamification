"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/app/actions";
import { Button } from "@/components/ui/button";

type Labels = {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  submitting: string;
  errorNameShort: string;
  errorNameLong: string;
  errorEmail: string;
  errorEmailExists: string;
  errorPasswordWeak: string;
  errorAuthFailed: string;
  successConfirmEmail: string;
  hint: string;
};

const initialState: RegisterState = { ok: false };

export function RegisterForm({ labels }: { labels: Labels }) {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  const errorMessage =
    state.error === "name_too_short"
      ? labels.errorNameShort
      : state.error === "name_too_long"
      ? labels.errorNameLong
      : state.error === "invalid_email"
      ? labels.errorEmail
      : state.error === "email_exists"
      ? labels.errorEmailExists
      : state.error === "password_weak"
      ? labels.errorPasswordWeak
      : state.error
      ? labels.errorAuthFailed
      : null;

  return (
    <form action={formAction} className="space-y-4">
      {state.needsConfirmation ? (
        <p
          role="status"
          className="rounded border border-brand-green/40 bg-brand-green/10 px-3 py-2 text-sm text-brand-green"
        >
          {labels.successConfirmEmail}
        </p>
      ) : null}
      <div>
        <label
          htmlFor="register-name"
          className="brand-section-label mb-1 block"
        >
          {labels.nameLabel}
        </label>
        <input
          id="register-name"
          name="displayName"
          type="text"
          required
          minLength={2}
          maxLength={40}
          autoComplete="nickname"
          placeholder={labels.namePlaceholder}
          className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-white/40 focus:border-brand-green focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="brand-section-label mb-1 block"
        >
          {labels.emailLabel}
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={labels.emailPlaceholder}
          className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-white/40 focus:border-brand-green focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="brand-section-label mb-1 block"
        >
          {labels.passwordLabel}
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={labels.passwordPlaceholder}
          className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-white/40 focus:border-brand-green focus:outline-none"
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded border border-brand-orange/40 bg-brand-orange/10 px-3 py-2 text-sm text-brand-orange"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? labels.submitting : labels.submit}
      </Button>

      <p className="text-xs text-white/50">{labels.hint}</p>
    </form>
  );
}
