"use client";

import { useActionState, useEffect, useState } from "react";
import {
  requestPasswordResetAction,
  type ForgotPasswordState,
} from "@/app/actions";
import { Button } from "@/components/ui/button";

type Labels = {
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  errorEmail: string;
  errorGeneric: string;
  errorRedirectNotAllowed: string;
  errorAuthCallback: string;
  errorNotConfigured: string;
};

const initialState: ForgotPasswordState = { ok: false };

export function ForgotPasswordForm({
  labels,
  callbackError,
}: {
  labels: Labels;
  callbackError?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState
  );
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (state.ok) setEmailSent(true);
  }, [state.ok]);

  if (emailSent || state.ok) {
    return (
      <p
        role="status"
        className="rounded border border-brand-green/40 bg-brand-green/10 px-4 py-3 text-sm text-brand-green"
      >
        {labels.success}
      </p>
    );
  }

  const errorMessage =
    callbackError === "auth_callback"
      ? labels.errorAuthCallback
      : state.error === "invalid_email"
        ? labels.errorEmail
        : state.error === "not_configured"
          ? labels.errorNotConfigured
          : state.error === "redirect_not_allowed"
            ? labels.errorRedirectNotAllowed
            : state.error
              ? labels.errorGeneric
              : null;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="forgot-email" className="brand-section-label mb-1 block">
          {labels.emailLabel}
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={labels.emailPlaceholder}
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
    </form>
  );
}
