"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { techniques } from "@/lib/theme-variant";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full border border-text-muted/30 bg-white/80 px-4 py-2 text-sm text-text",
        "placeholder:text-text-muted/60",
        "outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        techniques.clay.base,
        techniques.clay.shadow,
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
