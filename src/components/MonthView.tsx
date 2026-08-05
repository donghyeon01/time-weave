"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { Card } from "@/components/ui/Card";
import type { Event } from "@/types/client";

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  onSelectDate: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onSelectDate,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = Math.ceil(days.length / 7);

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
    <Card color="white" className="p-4">
      <div className="mb-2 grid grid-cols-7 text-center text-sm font-semibold text-text-muted">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        style={{ gridTemplateRows: `repeat(${weeks}, minmax(100px, 1fr))` }}>
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex min-h-25 cursor-pointer flex-col items-start rounded-xl p-2 text-left ${
                isCurrentMonth ? "bg-primary/30" : "bg-white"
              } ${isToday ? "ring-2 ring-primary-dark" : ""}`}>
              <span className="text-sm font-medium text-text">
                {format(day, "d", { locale: ko })}
              </span>
              <div className="mt-1 flex w-full flex-col gap-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-text-muted">
                    +{dayEvents.length - 3}개
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
