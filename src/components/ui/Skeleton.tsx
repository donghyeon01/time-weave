"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({
  lines = 1,
  className,
  ...props
}: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-full animate-pulse rounded-lg bg-text-muted/20"
        />
      ))}
    </div>
  );
}
