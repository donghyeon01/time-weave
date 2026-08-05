"use client";

import { addMonths, addWeeks, addDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import {
  useCalendarViewStore,
  type CalendarView,
} from "@/stores/calendarViewStore";

export function CalendarHeader() {
  const { view, currentDate, setView, setCurrentDate, moveToday } =
    useCalendarViewStore();

  const move = (direction: 1 | -1) => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, direction));
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, direction));
    } else {
      setCurrentDate(addDays(currentDate, direction));
    }
  };

  const label =
    view === "day"
      ? format(currentDate, "yyyy년 M월 d일", { locale: ko })
      : format(currentDate, "yyyy년 M월", { locale: ko });

  const views: CalendarView[] = ["month", "week", "day"];

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => move(-1)}
          color="primary"
          aria-label="이전"
          className="px-3 py-1">
          ◀
        </Button>
        <h2 className="min-w-37.5 text-center text-xl font-bold text-text">
          {label}
        </h2>
        <Button
          onClick={() => move(1)}
          color="primary"
          aria-label="다음"
          className="px-3 py-1">
          ▶
        </Button>
      </div>

      <div className="flex gap-2">
        {views.map((v) => (
          <Button
            key={v}
            onClick={() => setView(v)}
            color="primary"
            className="px-4 py-1 capitalize"
            style={
              view === v
                ? ({
                    "--bg-color": "var(--color-primary-dark)",
                    "--text-color": "#ffffff",
                  } as unknown as React.CSSProperties)
                : undefined
            }>
            {v === "month" ? "월" : v === "week" ? "주" : "일"}
          </Button>
        ))}
        <Button
          onClick={moveToday}
          color="primary"
          className="px-4 py-1"
          style={
            {
              "--bg-color": "var(--color-white)",
              "--text-color": "var(--color-text)",
              "--shadow-color": "var(--color-text)",
            } as unknown as React.CSSProperties
          }>
          오늘
        </Button>
      </div>
    </div>
  );
}
