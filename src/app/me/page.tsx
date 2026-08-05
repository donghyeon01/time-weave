"use client";

import { useEffect, useState } from "react";
import { useMe, useUpdateMe } from "@/hooks/useMe";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ErrorState";

export default function MePage() {
  const { data: user, isLoading, isError, refetch } = useMe();
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const updateMe = useUpdateMe();

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!nickname.trim()) {
      setMessage("닉네임을 입력해 주세요.");
      return;
    }

    updateMe.mutate(
      { nickname: nickname.trim() },
      {
        onSuccess: () => {
          setMessage("프로필이 저장되었습니다.");
        },
        onError: (err) => {
          setMessage(err.message);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold">내 정보</h1>
        <Card className="mt-6">
          <Skeleton lines={5} />
        </Card>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold">내 정보</h1>
        <ErrorState
          message="사용자 정보를 불러올 수 없습니다."
          onRetry={() => refetch()}
          className="mt-6"
        />
      </main>
    );
  }

  const hasChanged = nickname.trim() !== user.nickname;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">내 정보</h1>

      <Card as="section" color="primary" technique="glass" className="mt-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={user.profileImage}
            fallback={user.nickname}
            size={64}
            alt="프로필"
          />
          <div>
            <p className="text-lg font-semibold text-text">{user.name}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="me-nickname">닉네임</Label>
            <Input
              id="me-nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setMessage(null);
              }}
              className="mt-1"
            />
          </div>

          <p className="text-sm text-text-muted">
            로그인 방식: {user.provider}
          </p>

          <Button
            type="submit"
            disabled={!hasChanged || updateMe.isPending}
            className="w-full">
            {updateMe.isPending ? "저장 중..." : "저장"}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              updateMe.isSuccess ? "text-success-dark" : "text-warning-dark"
            }`}>
            {message}
          </p>
        )}
      </Card>
    </main>
  );
}
