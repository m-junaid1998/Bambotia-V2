/**
 * Shared API response/error typing.
 *
 * The backend wraps every response in a common envelope. Individual
 * hooks/services can extend `ApiResponse<T>` with a more specific `data`
 * shape instead of relying on `any`.
 */
// The backend doesn't publish shared response types, so `data`'s inner shape
// can't be statically known at this generic layer. This is the single,
// intentional `any` boundary for the whole app: every hook narrows it to a
// concrete interface (e.g. `CartResponse`, `ProductsResponse`) at the call
// site instead of the `any`/`error: any` sprinkled through the rest of the
// codebase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    totalCount?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
    isAllRecord?: boolean;
    [key: string]: unknown;
  };
  stats?: Record<string, number>;
  [key: string]: unknown;
}

/** Shape RTK Query rejects mutations/queries with (fetchBaseQuery error). */
export interface ApiErrorShape {
  status?: number | string;
  data?: {
    message?: string;
    [key: string]: unknown;
  };
  error?: string;
}

/**
 * Narrow an unknown rejection (from `.unwrap()` or a query's `error` field)
 * down to a human-readable message, falling back to a caller-supplied
 * default. Centralizing this removes the `error: any` + `error?.data?.message`
 * pattern that was duplicated across every hook.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const shaped = error as ApiErrorShape;
    if (shaped.data?.message) return shaped.data.message;
    if (typeof shaped.error === "string") return shaped.error;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** True when a rejection represents a 401 the app should treat as "logged out". */
export function isUnauthorizedError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    (error as ApiErrorShape).status === 401
  );
}
