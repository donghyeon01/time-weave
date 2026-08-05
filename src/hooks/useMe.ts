import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api";
import type { User } from "@/types/client";

export const userKeys = {
  me: ["me"] as const,
};

export function useMe() {
  return useQuery<User>({
    queryKey: userKeys.me,
    queryFn: () => http.get<User>("users/me"),
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { nickname: string }>({
    mutationFn: (body) => http.patch<User>("users/me", { json: body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}
