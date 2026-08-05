"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./Label";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({
  label,
  className,
  onChange,
  ...props
}: CheckboxProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "h-5 w-5 cursor-pointer accent-success rounded border border-text-muted/30",
          className,
        )}
        onChange={(e) => onChange?.(e.target.checked)}
        {...props}
      />
      {label && <Label htmlFor={id}>{label}</Label>}
    </div>
  );
}
