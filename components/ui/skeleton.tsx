import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ColorKey;
  technique?: TechniqueKey;
}

export function Skeleton({
  color = "primary",
  technique = "clay",
  className,
  ...props
}: SkeletonProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse",
        "bg-[var(--bg-color)]/40",
        t.base,
        t.shadow,
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
    />
  );
}
