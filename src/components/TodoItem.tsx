"use client";

import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Task } from "@/types/client";

interface TodoItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TodoItem({ task, onEdit }: TodoItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const toggle = () => {
    updateTask.mutate({ id: task.id, body: { completed: !task.completed } });
  };

  return (
    <li className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-glass">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onChange={toggle}
          aria-label="할 일 완료"
        />
        <div>
          <p
            className={`font-semibold ${
              task.completed ? "text-text-muted line-through" : "text-text"
            }`}>
            {task.title}
          </p>
          {task.dueDate && (
            <p className="text-sm text-text-muted">
              {new Date(task.dueDate).toLocaleString("ko-KR")}
            </p>
          )}
          {task.description && (
            <p className="text-sm text-text-muted">{task.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onEdit(task)}
          color="primary"
          className="px-3 py-1 text-xs">
          수정
        </Button>
        <Button
          onClick={() => deleteTask.mutate(task.id)}
          color="fail"
          className="px-3 py-1 text-xs">
          삭제
        </Button>
      </div>
    </li>
  );
}
