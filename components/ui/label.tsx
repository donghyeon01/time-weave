import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  color?: ColorKey;
}

export function Label({
  color = "primary",
  className,
  children,
  ...props
}: LabelProps) {
  const c = colors[color];

  return (
    <label
      className={cn(
        "inline-block text-sm font-medium",
        "text-[var(--text-color)]",
        className,
      )}
      style={
        {
          "--text-color": c.text,
        } as React.CSSProperties
      }
      {...props}>
      {children}
    </label>
  );
}
