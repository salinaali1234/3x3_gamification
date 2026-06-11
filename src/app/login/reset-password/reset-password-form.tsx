"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

type Labels = {
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  errorPasswordWeak: string;
  errorPasswordMismatch: string;
  errorSessionExpired: string;
  errorAuthFailed: string;
};

const initialState: ResetPasswordState = { ok: false };

export function ResetPasswordForm({ labels }: { labels: Labels }) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );

  const errorMessage =
    state.error === "password_weak"
      ? labels.errorPasswordWeak
      : state.error === "password_mismatch"
        ? labels.errorPasswordMismatch
        : state.error === "session_expired"
          ? labels.errorSessionExpired
          : state.error
            ? labels.errorAuthFailed
            : null;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="reset-password"
          className="brand-section-label mb-1 block"
        >
          {labels.passwordLabel}
        </label>
        <PasswordInput
          id="reset-password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={labels.passwordPlaceholder}
          showLabel={labels.showPassword}
          hideLabel={labels.hidePassword}
        />
      </div>

      <div>
        <label
          htmlFor="reset-password-confirm"
          className="brand-section-label mb-1 block"
        >
          {labels.confirmPasswordLabel}
        </label>
        <PasswordInput
          id="reset-password-confirm"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={labels.passwordPlaceholder}
          showLabel={labels.showPassword}
          hideLabel={labels.hidePassword}
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
