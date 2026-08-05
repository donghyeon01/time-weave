"use client";

import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useDeleteEvent } from "@/hooks/useEvents";
import { Button } from "@/components/ui/Button";
import type { Event } from "@/types/client";

interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const deleteEvent = useDeleteEvent();
  const start = parseISO(event.startTime);
  const end = parseISO(event.endTime);

  return (
    <div
      onClick={() => onSelect?.(event)}
      className={`rounded-xl border border-primary-accent bg-primary p-3 shadow-glass ${
        onSelect ? "cursor-pointer" : ""
      }`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(event);
        }
      }}>
      <div className="flex items-start justify-between">
        <p className="font-semibold text-primary-dark">{event.title}</p>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            deleteEvent.mutate(event.id);
          }}
          color="fail"
          technique="flat"
          className="px-2 py-0.5 text-xs"
          aria-label="일정 삭제">
          삭제
        </Button>
      </div>
      <p className="text-sm text-primary-dark">
        {event.allDay
          ? format(start, "yyyy-MM-dd", { locale: ko })
          : `${format(start, "MM/dd HH:mm", { locale: ko })} - ${format(end, "HH:mm", { locale: ko })}`}
      </p>
      {event.location && (
        <p className="text-xs text-text-muted">{event.location}</p>
      )}
    </div>
  );
}
