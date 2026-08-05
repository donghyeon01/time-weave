"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./Label";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
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
        {...props}
      />
      {label && <Label htmlFor={id}>{label}</Label>}
    </div>
  );
}
