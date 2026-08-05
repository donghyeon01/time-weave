"use client";

import {
  useReceivedRequests,
  useSentRequests,
  useAcceptFriendRequest,
  useDeleteFriendship,
} from "@/hooks/useFriends";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export function ReceivedRequests() {
  const { data, isLoading, isError, refetch } = useReceivedRequests();
  const accept = useAcceptFriendRequest();
  const remove = useDeleteFriendship();

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
        message="받은 요청을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message="받은 요청이 없습니다." />;
  }

  return (
    <ul className="space-y-3">
      {data.map((request) => (
        <li
          key={request.id}
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-glass">
          <div>
            <p className="font-semibold text-text">
              {request.counterparty?.nickname ?? "알 수 없는 사용자"}
            </p>
            <p className="text-sm text-text-muted">
              {request.counterparty?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => accept.mutate(request.id)}
              color="success"
              className="px-3 py-1 text-xs">
              수락
            </Button>
            <Button
              onClick={() => remove.mutate(request.id)}
              color="fail"
              className="px-3 py-1 text-xs">
              거절
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SentRequests() {
  const { data, isLoading, isError, refetch } = useSentRequests();
  const remove = useDeleteFriendship();

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
        message="보낸 요청을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message="보낸 요청이 없습니다." />;
  }

  return (
    <ul className="space-y-3">
      {data.map((request) => (
        <li
          key={request.id}
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-glass">
          <div>
            <p className="font-semibold text-text">
              {request.counterparty?.nickname ?? "알 수 없는 사용자"}
            </p>
            <p className="text-sm text-text-muted">
              {request.counterparty?.email}
            </p>
          </div>
          <Button
            onClick={() => remove.mutate(request.id)}
            color="fail"
            className="px-3 py-1 text-xs">
            취소
          </Button>
        </li>
      ))}
    </ul>
  );
}
