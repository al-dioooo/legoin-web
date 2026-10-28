import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type ButtonVariant = "primary" | "secondary" | "highlight" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

// Filled buttons carry a hard ink shadow and press into it; outlined ones stay flat.
const variants: Record<ButtonVariant, string> = {
  primary:
    "border-ink bg-primary text-primary-foreground shadow-button hover:bg-primary-hover active:shadow-pressed",
  secondary: "border-ink bg-page text-ink hover:bg-highlight",
  highlight:
    "border-ink bg-highlight text-highlight-foreground shadow-button hover:bg-highlight-hover active:shadow-pressed",
  ghost: "border-transparent text-ink hover:bg-highlight-subtle",
  // Red is the brand, so destructive actions are outlined and confirmed, never filled.
  danger: "border-danger bg-page text-danger hover:bg-danger-subtle",
};

// md keeps a 48px tap target; sm is for dense rows on desktop.
const sizes: Record<ButtonSize, string> = {
  md: "min-h-12 px-6 text-base",
  sm: "min-h-10 px-4 text-sm",
};

type ButtonStyleOptions = { variant?: ButtonVariant; size?: ButtonSize };

/** Button classes, also for links that look like buttons. */
export function buttonStyles({
  variant = "primary",
  size = "md",
}: ButtonStyleOptions = {}) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-full border-[2.5px] font-semibold transition-[rotate,translate,box-shadow,background-color] duration-300 ease-spring hover:-rotate-1 active:translate-x-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
  );
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleOptions;

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}
