"use client";

import { format, isSameDay, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { EmptyState } from "./EmptyState";
import type { Event } from "@/types/client";

interface DayViewProps {
  currentDate: Date;
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export function DayView({ currentDate, events, onSelectEvent }: DayViewProps) {
  const dayEvents = events
    .filter((event) => isSameDay(parseISO(event.startTime), currentDate))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  return (
    <div className="rounded-2xl bg-white p-4 shadow-glass">
      <h2 className="text-center text-xl font-bold text-text">
        {format(currentDate, "yyyy년 M월 d일 EEEE", { locale: ko })}
      </h2>
      <div className="mt-4 space-y-3">
        {dayEvents.length === 0 ? (
          <EmptyState message="등록된 일정이 없습니다." />
        ) : (
          dayEvents.map((event) => (
            <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
          ))
        )}
      </div>
    </div>
  );
}
