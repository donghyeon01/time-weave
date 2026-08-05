"use client";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl bg-fail/20 p-6 text-center",
        className,
      )}>
      <p className="text-fail-dark">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} color="primary">
          다시 시도
        </Button>
      )}
    </div>
  );
}
