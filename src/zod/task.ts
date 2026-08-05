import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "제목은 문자열이어야 합니다." })
    .min(1, "제목을 입력해 주세요.")
    .max(100, "제목은 100자 이하여야 합니다."),
  description: z
    .string()
    .max(500, "내용은 500자 이하여야 합니다.")
    .optional(),
  dueDate: z.coerce.date().optional(),
  completed: z.boolean().default(false),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해 주세요.")
    .max(100, "제목은 100자 이하여야 합니다.")
    .optional(),
  description: z
    .string()
    .max(500, "내용은 500자 이하여야 합니다.")
    .optional(),
  dueDate: z.coerce.date().optional(),
  completed: z.boolean().optional(),
});

export const taskIdParamSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "유효하지 않은 Task ID입니다.",
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
