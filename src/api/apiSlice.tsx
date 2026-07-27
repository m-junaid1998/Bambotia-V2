import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { dataToQueryParameter } from "./APIHelper";
import { baseUrl } from "./config";
import type { ApiResponse } from "./types";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";

/** Query/mutation argument shared by the generic `crud`/`upload` endpoints. */
export interface GenericArg {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/** Argument accepted by `gets` — either a bare endpoint string or `{ endpoint, params }`. */
export type GetsArg = string | { endpoint: string; params?: Record<string, unknown> };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/api/`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Interceptor wrapper around the base query: on a 401 response it logs the
 * user out (clearing the persisted token/user) so stale sessions can't keep
 * making authenticated requests that will only ever fail. Add further
 * cross-cutting concerns (retry, global toasts, request logging) here rather
 * than in individual hooks.
 */
const baseQueryWithInterceptors: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithInterceptors,
  endpoints: (builder) => ({
    gets: builder.query<ApiResponse, GetsArg>({
      query: (arg) => {
        const endpoint = typeof arg === "string" ? arg : arg?.endpoint;
        const params =
          typeof arg === "object" && arg?.params ? dataToQueryParameter(arg.params) : "";
        return `${endpoint}${params}`;
      },
    }),

    crud: builder.mutation<ApiResponse, GenericArg>({
      query: ({ endpoint, method = "POST", data, params, headers }) => ({
        url: params ? `${endpoint}${dataToQueryParameter(params)}` : endpoint,
        method,
        body: data,
        headers: headers || { "Content-Type": "application/json" },
      }),
    }),

    upload: builder.mutation<ApiResponse, GenericArg>({
      query: ({ endpoint, data, method = "POST", params }) => {
        let bodyData: FormData | unknown = data;
        if (data && !(data instanceof FormData)) {
          const formData = new FormData();
          Object.entries(data as Record<string, unknown>).forEach(([key, value]) =>
            formData.append(key, value as string | Blob),
          );
          bodyData = formData;
        }
        return {
          url: params ? `${endpoint}${dataToQueryParameter(params)}` : endpoint,
          method,
          body: bodyData,
        };
      },
    }),
  }),
});

export const { useLazyGetsQuery, useGetsQuery, useCrudMutation, useUploadMutation } = apiSlice;
