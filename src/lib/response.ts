import type { ApiResponse, ApiError, ApiMeta } from "@/types/common";

export function createSuccessResponse<T>(
  data: T,
  meta?: ApiMeta,
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta !== undefined && { meta }),
  } as ApiResponse<T>;
}

export function createErrorResponse(
  message: string,
  code: string = "INTERNAL_ERROR",
  details?: unknown,
): ApiResponse<never> {
  const error: ApiError = { code, message, details };
  return {
    success: false,
    error,
  };
}
