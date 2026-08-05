"use client";

import { useSchedulingStore } from "@/stores/schedulingStore";
import { useFriends } from "@/hooks/useFriends";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { http } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { RecommendedSlot, SchedulingApiResponse } from "@/types/client";

interface SchedulingFormProps {
  onResult: (slots: RecommendedSlot[]) => void;
}

export function SchedulingForm({ onResult }: SchedulingFormProps) {
  const { data: friends, isLoading, isError } = useFriends();
  const { selectedIds, startDate, endDate, toggleParticipant, setPeriod } =
    useSchedulingStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slotMinutes, setSlotMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFriends =
    friends?.filter((friend) => selectedIds.includes(friend.id)) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedIds.length === 0 || !startDate || !endDate || !title) {
      setError("제목, 참여자, 기간을 입력해 주세요.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const body: Record<string, unknown> = {
      title,
      description: description || undefined,
      startDate: start,
      endDate: end,
      participantIds: selectedIds,
    };

    const minutes = Number(slotMinutes);
    if (slotMinutes && minutes >= 15 && minutes <= 180) {
      body.slotMinutes = minutes;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await http.post<SchedulingApiResponse>("scheduling", {
        json: body,
      });

      const slots: RecommendedSlot[] = data.slots.map((slot) => ({
        start: slot.startTime,
        end: slot.endTime,
        score: slot.percent,
        availableParticipants: selectedFriends
          .slice(0, slot.availableCount)
          .map((friend) => friend.nickname),
      }));

      onResult(slots);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "조율 요청에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton lines={5} />;
  }

  if (isError) {
    return <ErrorState message="친구 목록을 불러오지 못했습니다." />;
  }

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <Card as="section" color="primary" className="space-y-4">
      <h2 className="text-lg font-semibold text-text">조율 조건</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="scheduling-title">조율 제목</Label>
          <Input
            id="scheduling-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="조율 제목"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="scheduling-description">설명</Label>
          <Textarea
            id="scheduling-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            className="mt-1"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text">참여자</p>
          {friends && friends.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {friends.map((friend) => {
                const selected = isSelected(friend.id);
                return (
                  <Button
                    key={friend.id}
                    type="button"
                    color="primary"
                    onClick={() => toggleParticipant(friend.id)}
                    style={
                      selected
                        ? ({
                            "--bg-color": "var(--color-primary-dark)",
                            "--text-color": "#ffffff",
                          } as unknown as React.CSSProperties)
                        : undefined
                    }
                    className="px-3 py-1 text-xs">
                    {friend.nickname}
                  </Button>
                );
              })}
            </div>
          ) : (
            <EmptyState message="선택할 친구가 없습니다." />
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="scheduling-startDate">시작일</Label>
            <Input
              id="scheduling-startDate"
              type="date"
              value={startDate}
              onChange={(e) =>
                setPeriod(e.target.value, endDate || e.target.value)
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="scheduling-endDate">종료일</Label>
            <Input
              id="scheduling-endDate"
              type="date"
              value={endDate}
              onChange={(e) =>
                setPeriod(startDate || e.target.value, e.target.value)
              }
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="scheduling-slotMinutes">
            슬롯 길이(분, 15~180, 선택)
          </Label>
          <Input
            id="scheduling-slotMinutes"
            type="number"
            min={15}
            max={180}
            value={slotMinutes}
            onChange={(e) => setSlotMinutes(e.target.value)}
            placeholder="미입력 시 기본 블록 사용"
            className="mt-1"
          />
        </div>

        {error && <p className="text-sm text-fail-dark">{error}</p>}

        <Button
          type="submit"
          disabled={
            loading || selectedIds.length === 0 || !startDate || !endDate
          }
          className="w-full">
          {loading ? "계산 중..." : "추천 슬롯 보기"}
        </Button>
      </form>
    </Card>
  );
}

interface RecommendedSlotsProps {
  slots: RecommendedSlot[];
}

export function RecommendedSlots({ slots }: RecommendedSlotsProps) {
  if (slots.length === 0) {
    return null;
  }

  return (
    <Card color="primary" className="mt-6">
      <h2 className="text-lg font-semibold text-text">추천 슬롯</h2>
      <ul className="mt-4 space-y-3">
        {slots.map((slot, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-xl bg-success/20 p-4">
            <div>
              <p className="font-semibold text-success-dark">
                {format(parseISO(slot.start), "MM/dd HH:mm")} ~{" "}
                {format(parseISO(slot.end), "HH:mm")}
              </p>
              <p className="text-sm text-text-muted">
                참여 가능 인원: {slot.availableParticipants.length}명
              </p>
            </div>
            <Badge color="success">{slot.score}점</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
