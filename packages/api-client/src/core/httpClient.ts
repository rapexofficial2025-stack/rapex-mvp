import { ApiClientError } from "./errors";

/**
 * Generic, framework-agnostic HTTP client. Nothing in this file knows about
 * Xano's actual paths -- no endpoint names are guessed here. Once the real
 * API contract is available, a repository implementation calls
 * `httpClient.request({ path: "<real path>", ... })`; until then, every
 * repository uses its Mock implementation and never touches this client.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestConfig = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (payload: unknown) => unknown | Promise<unknown>;

export type HttpClientConfig = {
  baseUrl: string;
  getAuthToken?: () => string | null | Promise<string | null>;
  /** Headers sent on every request (e.g. X-RAPEX-App, Accept-Language) -- static or computed per-request. */
  staticHeaders?: Record<string, string> | (() => Record<string, string>);
};

export type HttpClient = {
  request<T>(config: RequestConfig): Promise<T>;
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
};

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  return {
    addRequestInterceptor(interceptor) {
      requestInterceptors.push(interceptor);
    },
    addResponseInterceptor(interceptor) {
      responseInterceptors.push(interceptor);
    },
    async request<T>(initialConfig: RequestConfig): Promise<T> {
      let requestConfig = initialConfig;
      for (const interceptor of requestInterceptors) {
        requestConfig = await interceptor(requestConfig);
      }

      const base = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;
      const url = new URL(requestConfig.path.replace(/^\//, ""), base);
      if (requestConfig.query) {
        for (const [key, value] of Object.entries(requestConfig.query)) {
          if (value !== undefined) url.searchParams.set(key, String(value));
        }
      }

      const staticHeaders =
        typeof config.staticHeaders === "function" ? config.staticHeaders() : (config.staticHeaders ?? {});
      const headers: Record<string, string> = { "Content-Type": "application/json", ...staticHeaders };
      const token = config.getAuthToken ? await config.getAuthToken() : null;
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url.toString(), {
        method: requestConfig.method ?? "GET",
        headers,
        body: requestConfig.body !== undefined ? JSON.stringify(requestConfig.body) : undefined,
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      for (const interceptor of responseInterceptors) {
        payload = await interceptor(payload);
      }

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message: unknown }).message)
            : `Request to ${requestConfig.path} failed with status ${response.status}`;
        throw new ApiClientError(response.status, "REQUEST_FAILED", message);
      }

      return payload as T;
    },
  };
}
