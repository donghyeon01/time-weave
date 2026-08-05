"use client";

import { useEffect, useState } from "react";
import { useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import type { Event } from "@/types/client";

interface EventFormProps {
  editing?: Event | null;
  onDone?: () => void;
}

export function EventForm({ editing, onDone }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description ?? "");
      setLocation(editing.location ?? "");
      setStart(
        typeof editing.startTime === "string"
          ? editing.startTime.slice(0, 16)
          : "",
      );
      setEnd(
        typeof editing.endTime === "string" ? editing.endTime.slice(0, 16) : "",
      );
      setAllDay(editing.allDay);
    } else {
      setTitle("");
      setDescription("");
      setLocation("");
      setStart("");
      setEnd("");
      setAllDay(false);
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      title,
      description: description || undefined,
      location: location || undefined,
      startTime: new Date(start),
      endTime: new Date(end),
      allDay,
    };

    if (editing) {
      updateEvent.mutate(
        { id: editing.id, body },
        {
          onSuccess: () => {
            reset();
            onDone?.();
          },
        },
      );
    } else {
      createEvent.mutate(body, {
        onSuccess: () => {
          reset();
          onDone?.();
        },
      });
    }
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setStart("");
    setEnd("");
    setAllDay(false);
  };

  const handleCancel = () => {
    reset();
    onDone?.();
  };

  return (
    <Card as="section" color="primary">
      <h2 className="text-lg font-semibold text-text">
        {editing ? "일정 수정" : "일정 추가"}
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <Label htmlFor="event-title">제목</Label>
          <Input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="event-location">장소</Label>
          <Input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="장소 (선택)"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="event-description">설명</Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            className="mt-1"
          />
        </div>
        <Checkbox
          label="종일"
          checked={allDay}
          onChange={(checked) => setAllDay(checked)}
        />
        <div>
          <Label htmlFor="event-start">시작</Label>
          <Input
            id="event-start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="event-end">종료</Label>
          <Input
            id="event-end"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {editing ? "수정" : "추가"}
          </Button>
          {editing && (
            <Button
              type="button"
              onClick={handleCancel}
              color="fail"
              className="flex-1">
              취소
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
