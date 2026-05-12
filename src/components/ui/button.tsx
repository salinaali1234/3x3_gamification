import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "orange" | "blue";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-green text-brand-black hover:bg-brand-green/90 active:bg-brand-green/80",
  secondary:
    "bg-brand-white text-brand-black hover:bg-brand-offwhite",
  outline:
    "border border-white/30 text-brand-white hover:border-brand-green hover:text-brand-green",
  ghost: "text-brand-white hover:bg-white/5",
  orange:
    "bg-brand-orange text-brand-black hover:bg-brand-orange/90",
  blue: "bg-brand-blue text-brand-black hover:bg-brand-blue/90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

type LinkButtonProps = CommonProps & {
  href: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, children, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
