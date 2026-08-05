import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api";
import type { Event } from "@/types/client";
import type { EventBodyInput } from "@/zod/event";

export const eventKeys = {
  all: ["events"] as const,
  range: (start: string, end: string) => ["events", { start, end }] as const,
};

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: eventKeys.all,
    queryFn: () => http.get<Event[]>("events"),
  });
}

export function useEventsInRange(start: string, end: string) {
  return useQuery<Event[]>({
    queryKey: eventKeys.range(start, end),
    queryFn: () =>
      http.get<Event[]>("events/range", { searchParams: { start, end } }),
    enabled: start !== "" && end !== "",
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, EventBodyInput>({
    mutationFn: (body) => http.post<Event>("events", { json: body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, { id: string; body: EventBodyInput }>({
    mutationFn: ({ id, body }) =>
      http.put<Event>(`events/${id}`, { json: body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => http.delete(`events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}
