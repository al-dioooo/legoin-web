import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type ButtonVariant = "primary" | "secondary" | "highlight" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border-[1.5px] border-ink bg-card text-ink hover:bg-callout",
  highlight: "bg-highlight text-highlight-foreground hover:bg-highlight-hover",
  ghost: "text-ink hover:bg-callout",
  // Red is the brand, so destructive actions are outlined and confirmed, never filled.
  danger:
    "border-[1.5px] border-danger bg-card text-danger hover:bg-danger-subtle",
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
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
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
