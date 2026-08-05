"use client";

import { useState } from "react";
import { useFriendSearch, useSendFriendRequest } from "@/hooks/useFriends";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export function FriendSearch() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data, isLoading, isError, refetch } = useFriendSearch(submitted);
  const sendRequest = useSendFriendRequest();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임 또는 이메일 검색"
          aria-label="닉네임 또는 이메일 검색"
        />
        <Button type="submit">검색</Button>
      </form>

      {isLoading && submitted && <Skeleton lines={3} />}

      {isError && submitted && (
        <ErrorState
          message="검색 중 오류가 발생했습니다."
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <ul className="space-y-3">
          {data.length === 0 ? (
            <EmptyState message="검색 결과가 없습니다." />
          ) : (
            data.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-glass">
                <div>
                  <p className="font-semibold text-text">{user.nickname}</p>
                  <p className="text-sm text-text-muted">{user.email}</p>
                </div>
                <Button
                  onClick={() => sendRequest.mutate(user.nickname)}
                  color="success"
                  className="px-3 py-1 text-xs">
                  요청
                </Button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
