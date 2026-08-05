import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  color?: ColorKey;
  technique?: TechniqueKey;
}

export function Input({
  color = "primary",
  technique = "clay",
  className,
  ...props
}: InputProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  return (
    <input
      className={cn(
        "w-full px-4 py-2.5 text-sm",
        "bg-[var(--bg-color)] text-[var(--text-color)]",
        "placeholder:text-[var(--text-color)]/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--shadow-color)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "read-only:opacity-70",
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
