import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { http } from "@/lib/api";
import type { Friend, FriendRequest } from "@/types/client";

export const friendKeys = {
  all: ["friends"] as const,
  received: ["friends", "received"] as const,
  sent: ["friends", "sent"] as const,
  search: (query: string) => ["friends", "search", query] as const,
};

export function useFriends() {
  return useQuery<Friend[]>({
    queryKey: friendKeys.all,
    queryFn: () => http.get<Friend[]>("friends"),
  });
}

export function useReceivedRequests() {
  return useQuery<FriendRequest[]>({
    queryKey: friendKeys.received,
    queryFn: () => http.get<FriendRequest[]>("friends/requests/received"),
  });
}

export function useSentRequests() {
  return useQuery<FriendRequest[]>({
    queryKey: friendKeys.sent,
    queryFn: () => http.get<FriendRequest[]>("friends/requests/sent"),
  });
}

export function useFriendSearch(query: string) {
  return useQuery<Friend[]>({
    queryKey: friendKeys.search(query),
    queryFn: () => http.get<Friend[]>("friends/search", { searchParams: { q: query } }),
    enabled: query.length > 0,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation<FriendRequest, Error, string>({
    mutationFn: (identifier) =>
      http.post<FriendRequest>("friends", { json: { identifier } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendKeys.all });
      void queryClient.invalidateQueries({ queryKey: friendKeys.sent });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation<FriendRequest, Error, string>({
    mutationFn: (id) =>
      http.post<FriendRequest>(`friends/requests/${id}/accept`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendKeys.all });
      void queryClient.invalidateQueries({ queryKey: friendKeys.received });
    },
  });
}

export function useDeleteFriendship() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => http.delete(`friends/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendKeys.all });
      void queryClient.invalidateQueries({ queryKey: friendKeys.received });
      void queryClient.invalidateQueries({ queryKey: friendKeys.sent });
    },
  });
}
