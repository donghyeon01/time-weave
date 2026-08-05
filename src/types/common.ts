export interface ApiMeta {
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
