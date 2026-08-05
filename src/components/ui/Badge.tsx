"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ColorKey;
}

export function Badge({
  color = "primary",
  className,
  children,
  ...props
}: BadgeProps) {
  const c = colors[color];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold",
        className,
      )}
      style={
        {
          backgroundColor: c.bg,
          color: c.text,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  );
}
