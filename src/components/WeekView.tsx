"use client";

import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { EventCard } from "./EventCard";
import type { Event } from "@/types/client";

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  onSelectDate: (date: Date) => void;
}

export function WeekView({ currentDate, events, onSelectDate }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const eventsForDay = (day: Date) =>
    events.filter((event) => {
      const start = parseISO(event.startTime);
      const end = parseISO(event.endTime);
      return (
        start.getTime() <= endOfDay(day).getTime() &&
        end.getTime() >= startOfDay(day).getTime()
      );
    });

  return (
    <div className="grid grid-cols-7 gap-2 rounded-2xl bg-white p-4 shadow-glass">
      {days.map((day) => {
        const dayEvents = eventsForDay(day);
        const today = isSameDay(day, new Date());

        return (
          <div
            key={day.toISOString()}
            role="button"
            tabIndex={0}
            onClick={() => onSelectDate(day)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectDate(day);
              }
            }}
            className={`flex min-h-50 cursor-pointer flex-col rounded-xl p-2 text-left ${
              today ? "bg-primary/30 ring-2 ring-primary-dark" : "bg-primary/10"
            }`}>
            <span className="text-center text-sm font-semibold text-text">
              {format(day, "E", { locale: ko })}
            </span>
            <span
              className={`text-center text-lg font-bold ${
                today ? "text-primary-dark" : "text-text"
              }`}>
              {format(day, "d", { locale: ko })}
            </span>
            <div className="mt-2 flex flex-col gap-1">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
