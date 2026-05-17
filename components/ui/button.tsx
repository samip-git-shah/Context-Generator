"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_18px_hsl(var(--primary)/0.45)] hover:shadow-[0_0_24px_hsl(var(--primary)/0.7)] font-semibold",
  secondary:
    "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_16px_hsl(var(--accent)/0.5)] font-semibold",
  outline:
    "border border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:border-primary",
  ghost:
    "text-foreground hover:bg-primary/10 hover:text-primary",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_16px_hsl(var(--destructive)/0.5)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
