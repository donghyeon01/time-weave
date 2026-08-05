import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { http } from "@/lib/api";
import type { Task } from "@/types/client";
import type { CreateTaskInput, UpdateTaskInput } from "@/zod/task";

export const taskKeys = {
  all: ["tasks"] as const,
};

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: taskKeys.all,
    queryFn: () => http.get<Task[]>("tasks"),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: (body) => http.post<Task>("tasks", { json: body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, { id: string; body: UpdateTaskInput }>({
    mutationFn: ({ id, body }) => http.put<Task>(`tasks/${id}`, { json: body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => http.delete(`tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
