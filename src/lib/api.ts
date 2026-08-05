import ky from "ky";
import type { ApiResponse } from "@/types/common";
import type { Options } from "ky";

function handleResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
}

const client = ky.create({
  prefixUrl: "/api",
  credentials: "same-origin",
  hooks: {
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          window.location.href = "/";
        }
      },
    ],
  },
});

export const http = {
  get: <T>(url: string, options?: Options) =>
    client.get(url, options).json<ApiResponse<T>>().then(handleResponse),

  post: <T>(url: string, options?: Options) =>
    client.post(url, options).json<ApiResponse<T>>().then(handleResponse),

  put: <T>(url: string, options?: Options) =>
    client.put(url, options).json<ApiResponse<T>>().then(handleResponse),

  patch: <T>(url: string, options?: Options) =>
    client.patch(url, options).json<ApiResponse<T>>().then(handleResponse),

  delete: (url: string, options?: Options) =>
    client.delete(url, options).then(() => undefined),
};
