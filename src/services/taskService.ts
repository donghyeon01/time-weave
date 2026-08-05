import { TaskModel, type ITask } from "@/models";
import { AppError } from "@/lib/error";
import { type CreateTaskInput, type UpdateTaskInput } from "@/zod/task";

export interface TaskResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

function toTaskResponse(task: ITask): TaskResponse {
  return {
    id: task._id.toString(),
    userId: task.userId.toString(),
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function assertOwner(task: ITask, userId: string): void {
  if (task.userId.toString() !== userId) {
    throw new AppError(
      "해당 할 일을 수정/삭제할 권한이 없습니다.",
      403,
      "FORBIDDEN",
    );
  }
}

export async function createTask(
  userId: string,
  input: CreateTaskInput,
): Promise<TaskResponse> {
  const task = await TaskModel.create({
    ...input,
    userId,
  });

  return toTaskResponse(task);
}

export async function getTasks(userId: string): Promise<TaskResponse[]> {
  const tasks = await TaskModel.find({ userId })
    .sort({ createdAt: -1 })
    .exec();

  return tasks.map(toTaskResponse);
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<TaskResponse> {
  const task = await TaskModel.findById(taskId).exec();

  if (!task) {
    throw new AppError("할 일을 찾을 수 없습니다.", 404, "TASK_NOT_FOUND");
  }

  assertOwner(task, userId);

  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.dueDate !== undefined) task.dueDate = input.dueDate;
  if (input.completed !== undefined) task.completed = input.completed;

  await task.save();
  return toTaskResponse(task);
}

export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<void> {
  const task = await TaskModel.findById(taskId).exec();

  if (!task) {
    throw new AppError("할 일을 찾을 수 없습니다.", 404, "TASK_NOT_FOUND");
  }

  assertOwner(task, userId);

  await task.deleteOne();
}
