"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction, type AuthFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

type Labels = {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  errorInvalidCredentials: string;
  errorEmailNotConfirmed: string;
  errorAuthFailed: string;
  forgotPasswordLink: string;
};

const initialState: AuthFormState = { ok: false };

export function LoginForm({ labels }: { labels: Labels }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState
  );

  const errorMessage =
    state.error === "invalid_credentials"
      ? labels.errorInvalidCredentials
      : state.error === "email_not_confirmed"
      ? labels.errorEmailNotConfirmed
      : state.error === "auth_failed"
      ? labels.errorAuthFailed
      : state.error
      ? labels.errorAuthFailed
      : null;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="brand-section-label mb-1 block">
          {labels.emailLabel}
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder}
          className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-white/40 focus:border-brand-green focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="brand-section-label mb-1 block"
        >
          {labels.passwordLabel}
        </label>
        <PasswordInput
          id="login-password"
          name="password"
          required
          autoComplete="current-password"
          minLength={8}
          value={password}
          onChange={setPassword}
          placeholder={labels.passwordPlaceholder}
          showLabel={labels.showPassword}
          hideLabel={labels.hidePassword}
        />
        <p className="mt-2 text-right">
          <Link
            href="/login/forgot-password"
            className="font-mono text-xs uppercase tracking-wider text-white/50 hover:text-brand-green"
          >
            {labels.forgotPasswordLink}
          </Link>
        </p>
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
    </form>
  );
}
