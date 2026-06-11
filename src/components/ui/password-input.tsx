"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PasswordInputProps = {
  id: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  showLabel: string;
  hideLabel: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function PasswordInput({
  id,
  name = "password",
  placeholder,
  autoComplete,
  minLength,
  required,
  showLabel,
  hideLabel,
  className,
  value,
  onChange,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(
          "w-full rounded border border-white/15 bg-white/5 py-3 pl-4 pr-24 text-base placeholder:text-white/40 focus:border-brand-green focus:outline-none",
          className
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        aria-controls={id}
        className="absolute right-3 top-1/2 -translate-y-1/2 min-h-11 px-2 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-brand-green"
      >
        {visible ? hideLabel : showLabel}
      </button>
    </div>
  );
}
