/**
 * Generic API envelope shape. PROVISIONAL — confirm against the real Xano response
 * format once the API contract is provided, and adjust here (single source of truth
 * for every app's request/response typing).
 */
export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: ApiError;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
