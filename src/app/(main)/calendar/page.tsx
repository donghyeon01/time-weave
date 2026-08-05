"use client";

import { useState } from "react";
import { useCalendarViewStore } from "@/stores/calendarViewStore";
import { useEvents } from "@/hooks/useEvents";
import { CalendarHeader } from "@/components/CalendarHeader";
import { MonthView } from "@/components/MonthView";
import { WeekView } from "@/components/WeekView";
import { DayView } from "@/components/DayView";
import { EventForm } from "@/components/EventForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import type { Event } from "@/types/client";

export default function CalendarPage() {
  const { view, currentDate, setCurrentDate, setView } = useCalendarViewStore();
  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const [editing, setEditing] = useState<Event | null>(null);

  const selectDate = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold">캘린더</h1>
        <Skeleton lines={8} className="mt-6" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold">캘린더</h1>
        <ErrorState
          message="일정을 불러오지 못했습니다."
          onRetry={() => refetch()}
          className="mt-6"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">캘린더</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <EventForm editing={editing} onDone={() => setEditing(null)} />

        <div>
          <CalendarHeader />

          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onSelectDate={selectDate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onSelectDate={selectDate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onSelectEvent={setEditing}
            />
          )}
        </div>
      </div>
    </main>
  );
}
