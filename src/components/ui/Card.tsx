"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "li";
  color?: ColorKey;
  technique?: TechniqueKey;
}

export function Card({
  as = "div",
  color = "primary",
  technique = "clay",
  className,
  children,
  ...props
}: CardProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";
  const Component = as;

  return (
    <Component
      className={cn("rounded-2xl p-6", t.base, t.shadow, className)}
      style={
        {
          "--bg-color": isGlass
            ? `color-mix(in srgb, ${c.bg} 20%, transparent)`
            : c.bg,
          "--text-color": c.text,
          "--shadow-color": c.shadowColor,
        } as React.CSSProperties
      }
      {...props}>
      {children}
    </Component>
  );
}
