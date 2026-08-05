export interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
