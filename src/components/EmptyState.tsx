"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card
      color="white"
      technique="glass"
      className="flex flex-col items-center gap-3 p-6 text-center">
      <p className="text-text-muted">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  );
}
