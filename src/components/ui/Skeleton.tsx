"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { techniques } from "@/lib/theme-variant";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({ lines = 1, className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 w-full animate-pulse rounded-2xl bg-white/60",
            techniques.glass.shadow,
          )}
        />
      ))}
    </div>
  );
}
