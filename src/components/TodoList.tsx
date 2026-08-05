"use client";

import { useTasks } from "@/hooks/useTasks";
import { TodoItem } from "./TodoItem";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import type { Task } from "@/types/client";

interface TodoListProps {
  onEdit: (task: Task) => void;
}

export function TodoList({ onEdit }: TodoListProps) {
  const { data: tasks, isLoading, isError, refetch } = useTasks();

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
        message="할 일을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState message="할 일이 없습니다." />;
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} onEdit={onEdit} />
      ))}
    </ul>
  );
}
