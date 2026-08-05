"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorKey;
  technique?: TechniqueKey;
}

export function Button({
  color = "primary",
  technique = "clay",
  className,
  children,
  ...props
}: ButtonProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-color)",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "bg-(--bg-color) text-(--text-color)",
        t.base,
        t.shadow,
        t.pressed,
        t.active,
        className,
      )}
      style={
        {
          "--bg-color": isGlass
            ? `color-mix(in srgb, ${c.bg} 20%, transparent)`
            : c.bg,
          "--text-color": c.text,
          "--shadow-color": c.shadowColor,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </button>
  );
}
