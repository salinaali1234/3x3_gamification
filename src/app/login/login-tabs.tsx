"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoginList } from "./login-list";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

type RegisterLabels = React.ComponentProps<typeof RegisterForm>["labels"];
type LoginLabels = React.ComponentProps<typeof LoginForm>["labels"];

export function LoginTabs({
  supabaseEnabled,
  options,
  tabExistingLabel,
  tabRegisterLabel,
  registerTitle,
  registerSubtitle,
  registerLabels,
  loginLabels,
  demoHint,
  initialTab = "existing",
}: {
  supabaseEnabled: boolean;
  options: React.ComponentProps<typeof LoginList>["options"];
  tabExistingLabel: string;
  tabRegisterLabel: string;
  registerTitle: string;
  registerSubtitle: string;
  registerLabels: RegisterLabels;
  loginLabels: LoginLabels;
  demoHint?: string;
  initialTab?: "existing" | "register";
}) {
  const [tab, setTab] = useState<"existing" | "register">(initialTab);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Login or register"
        className="inline-flex w-full sm:w-auto rounded-full border border-white/15 bg-white/[0.03] p-1 text-sm font-medium"
      >
        <button
          role="tab"
          type="button"
          aria-selected={tab === "existing"}
          onClick={() => setTab("existing")}
          className={cn(
            "flex-1 sm:flex-none rounded-full px-4 py-2 transition-colors",
            tab === "existing"
              ? "bg-brand-green text-brand-black"
              : "text-white/70 hover:text-white"
          )}
        >
          {tabExistingLabel}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === "register"}
          onClick={() => setTab("register")}
          className={cn(
            "flex-1 sm:flex-none rounded-full px-4 py-2 transition-colors",
            tab === "register"
              ? "bg-brand-green text-brand-black"
              : "text-white/70 hover:text-white"
          )}
        >
          {tabRegisterLabel}
        </button>
      </div>

      <div className="mt-6">
        {tab === "existing" ? (
          supabaseEnabled ? (
            <LoginForm labels={loginLabels} />
          ) : (
            <div>
              {demoHint ? (
                <p className="mb-4 text-sm text-white/50">{demoHint}</p>
              ) : null}
              <LoginList options={options} />
            </div>
          )
        ) : (
          <div>
            <h2 className="font-display text-3xl">{registerTitle}</h2>
            <p className="mt-2 mb-5 text-sm text-white/70">
              {registerSubtitle}
            </p>
            <RegisterForm labels={registerLabels} />
          </div>
        )}
      </div>
    </div>
  );
}
