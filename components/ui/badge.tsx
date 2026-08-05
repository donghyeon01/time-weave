import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ColorKey;
  technique?: TechniqueKey;
}

export function Badge({
  color = "primary",
  technique = "clay",
  className,
  children,
  ...props
}: BadgeProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-xs font-semibold",
        "bg-[var(--bg-color)] text-[var(--text-color)]",
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
      {...props}>
      {children}
    </span>
  );
}
