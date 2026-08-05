import { create } from "zustand";

interface SchedulingState {
  selectedIds: string[];
  startDate: string;
  endDate: string;
  toggleParticipant: (id: string) => void;
  setPeriod: (start: string, end: string) => void;
  reset: () => void;
}

export const useSchedulingStore = create<SchedulingState>((set) => ({
  selectedIds: [],
  startDate: "",
  endDate: "",
  toggleParticipant: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((value) => value !== id)
        : [...state.selectedIds, id],
    })),
  setPeriod: (start, end) => set({ startDate: start, endDate: end }),
  reset: () => set({ selectedIds: [], startDate: "", endDate: "" }),
}));
