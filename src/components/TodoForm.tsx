"use client";

import { useEffect, useState } from "react";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import type { Task } from "@/types/client";

interface TodoFormProps {
  editing?: Task | null;
  onDone?: () => void;
}

function parseDueDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function TodoForm({ editing, onDone }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description ?? "");
      setDueDate(
        typeof editing.dueDate === "string" ? editing.dueDate.slice(0, 16) : "",
      );
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDueDate = parseDueDate(dueDate);

    if (editing) {
      updateTask.mutate(
        {
          id: editing.id,
          body: {
            title,
            description: description || undefined,
            dueDate: parsedDueDate,
          },
        },
        { onSuccess: () => onDone?.() },
      );
    } else {
      createTask.mutate(
        {
          title,
          description: description || undefined,
          dueDate: parsedDueDate,
          completed: false,
        },
        {
          onSuccess: () => {
            setTitle("");
            setDescription("");
            setDueDate("");
            onDone?.();
          },
        },
      );
    }
  };

  return (
    <Card as="section" color="primary" technique="glass">
      <h2 className="text-lg font-semibold text-text">
        {editing ? "할 일 수정" : "할 일 추가"}
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="todo-title">제목</Label>
          <Input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="todo-description">설명</Label>
          <textarea
            id="todo-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            className="mt-1 w-full rounded-xl border border-text-muted/30 bg-white px-4 py-2 text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
          />
        </div>
        <div>
          <Label htmlFor="todo-dueDate">마감일</Label>
          <Input
            id="todo-dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full">
          {editing ? "수정" : "추가"}
        </Button>
      </form>
    </Card>
  );
}
