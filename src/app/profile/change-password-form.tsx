"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

type Labels = {
  currentPasswordLabel: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  success: string;
  errorPasswordWeak: string;
  errorPasswordMismatch: string;
  errorPasswordSame: string;
  errorWrongCurrentPassword: string;
  errorAuthFailed: string;
};

const initialState: ChangePasswordState = { ok: false };

export function ChangePasswordForm({ labels }: { labels: Labels }) {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  );

  const errorMessage =
    state.error === "password_weak"
      ? labels.errorPasswordWeak
      : state.error === "password_mismatch"
        ? labels.errorPasswordMismatch
        : state.error === "password_same"
          ? labels.errorPasswordSame
          : state.error === "wrong_current_password"
            ? labels.errorWrongCurrentPassword
            : state.error
              ? labels.errorAuthFailed
              : null;

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <div>
        <label
          htmlFor="current-password"
          className="brand-section-label mb-1 block"
        >
          {labels.currentPasswordLabel}
        </label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          required
          minLength={8}
          autoComplete="current-password"
          placeholder={labels.passwordPlaceholder}
          showLabel={labels.showPassword}
          hideLabel={labels.hidePassword}
        />
      </div>

      <div>
        <label htmlFor="new-password" className="brand-section-label mb-1 block">
          {labels.newPasswordLabel}
        </label>
        <PasswordInput
          id="new-password"
          name="newPassword"
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
          htmlFor="confirm-new-password"
          className="brand-section-label mb-1 block"
        >
          {labels.confirmPasswordLabel}
        </label>
        <PasswordInput
          id="confirm-new-password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={labels.passwordPlaceholder}
          showLabel={labels.showPassword}
          hideLabel={labels.hidePassword}
        />
      </div>

      {state.ok ? (
        <p
          role="status"
          className="rounded border border-brand-green/40 bg-brand-green/10 px-3 py-2 text-sm text-brand-green"
        >
          {labels.success}
        </p>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="rounded border border-brand-orange/40 bg-brand-orange/10 px-3 py-2 text-sm text-brand-orange"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
