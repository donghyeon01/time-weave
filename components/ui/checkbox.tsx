"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";
import { Label } from "./label";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  color?: ColorKey;
  technique?: TechniqueKey;
  label?: React.ReactNode;
}

export function Checkbox({
  color = "primary",
  technique = "clay",
  label,
  className,
  id,
  ...props
}: CheckboxProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="inline-flex items-center gap-2">
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          "peer h-5 w-5 shrink-0 cursor-pointer appearance-none",
          "bg-[var(--bg-color)] text-[var(--text-color)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--shadow-color)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "after:content-[''] after:block after:h-2.5 after:w-1.5",
          "after:mx-auto after:mt-0.5",
          "after:border-r-2 after:border-b-2 after:border-[var(--text-color)]",
          "after:rotate-45 after:opacity-0 checked:after:opacity-100",
          "after:transition-opacity",
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
      {label && (
        <Label htmlFor={inputId} color={color}>
          {label}
        </Label>
      )}
    </div>
  );
}
