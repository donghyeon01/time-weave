import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ColorKey;
  technique?: TechniqueKey;
  as?: "div" | "section" | "article";
}

export function Card({
  color = "primary",
  technique = "clay",
  as: Tag = "div",
  className,
  children,
  ...props
}: CardProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  return (
    <Tag
      className={cn(
        "overflow-hidden p-5",
        "bg-[var(--bg-color)] text-[var(--text-color)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--shadow-color)]",
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
    </Tag>
  );
}
