"use client";

import { useFriends, useDeleteFriendship } from "@/hooks/useFriends";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export function FriendList() {
  const { data: friends, isLoading, isError, refetch } = useFriends();
  const deleteFriendship = useDeleteFriendship();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton lines={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="친구 목록을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    );
  }

  if (!friends || friends.length === 0) {
    return <EmptyState message="등록된 친구가 없습니다." />;
  }

  return (
    <ul className="space-y-3">
      {friends.map((friend) => (
        <li
          key={friend.id}
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-glass">
          <div>
            <p className="font-semibold text-text">{friend.nickname}</p>
            <p className="text-sm text-text-muted">{friend.email}</p>
          </div>
          <Button
            onClick={() => deleteFriendship.mutate(friend.id)}
            color="fail"
            className="px-3 py-1 text-xs">
            삭제
          </Button>
        </li>
      ))}
    </ul>
  );
}
