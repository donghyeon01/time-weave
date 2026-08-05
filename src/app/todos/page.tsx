"use client";

import { useState } from "react";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import type { Task } from "@/types/client";

export default function TodosPage() {
  const [editing, setEditing] = useState<Task | null>(null);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">ToDo</h1>

      <div className="mt-6">
        <TodoForm
          editing={editing}
          onDone={() => setEditing(null)}
        />
      </div>

      <div className="mt-6">
        <TodoList onEdit={setEditing} />
      </div>
    </main>
  );
}
