import { z, ZodError, type ZodTypeAny } from "zod";
import { AppError } from "@/lib/error";

export function validateInput<T extends ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new AppError(
      "입력값 검증에 실패했습니다.",
      400,
      "VALIDATION_ERROR",
      parsed.error.issues,
    );
  }

  return parsed.data;
}

export { z, ZodError };
