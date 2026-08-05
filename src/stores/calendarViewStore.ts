import { create } from "zustand";

export type CalendarView = "month" | "week" | "day";

interface CalendarViewState {
  view: CalendarView;
  currentDate: Date;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  moveToday: () => void;
}

export const useCalendarViewStore = create<CalendarViewState>((set) => ({
  view: "month",
  currentDate: new Date(),
  setView: (view) => set({ view }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  moveToday: () => set({ currentDate: new Date() }),
}));
