import { ApiClientError } from "./errors";
import { DEFAULT_RETRY_CONFIG, backoffDelayMs, sleep, type RetryConfig } from "./retry";

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
  /** Overrides the default retry-by-method policy for this one call. */
  retryable?: boolean;
};

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (payload: unknown) => unknown | Promise<unknown>;

export type HttpClientConfig = {
  baseUrl: string;
  getAuthToken?: () => string | null | Promise<string | null>;
  /** Headers sent on every request (e.g. X-RAPEX-App, Accept-Language) -- static or computed per-request. */
  staticHeaders?: Record<string, string> | (() => Record<string, string>);
  /** Auth middleware: called once on any 401, before the error is thrown -- e.g. clear the stored token, redirect to login. */
  onUnauthorized?: () => void | Promise<void>;
  /** Defaults to DEFAULT_RETRY_CONFIG; pass `{ maxRetries: 0, ... }` to disable retries entirely. */
  retry?: Partial<RetryConfig>;
};

export type HttpClient = {
  request<T>(config: RequestConfig): Promise<T>;
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
};

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retry };

  async function performSingleRequest<T>(requestConfig: RequestConfig): Promise<T> {
    const base = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;
    const url = new URL(requestConfig.path.replace(/^\//, ""), base);
    if (requestConfig.query) {
      for (const [key, value] of Object.entries(requestConfig.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const staticHeaders =
      typeof config.staticHeaders === "function" ? config.staticHeaders() : (config.staticHeaders ?? {});
    // FormData (file uploads) must NOT get a JSON Content-Type or be
    // stringified -- fetch sets the correct multipart boundary itself only
    // when it sees a real FormData body untouched.
    const isFormData = typeof FormData !== "undefined" && requestConfig.body instanceof FormData;
    const headers: Record<string, string> = { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...staticHeaders };
    const token = config.getAuthToken ? await config.getAuthToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method: requestConfig.method ?? "GET",
      headers,
      body: requestConfig.body === undefined ? undefined : isFormData ? (requestConfig.body as FormData) : JSON.stringify(requestConfig.body),
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
      if (response.status === 401 && config.onUnauthorized) {
        await config.onUnauthorized();
      }
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : `Request to ${requestConfig.path} failed with status ${response.status}`;
      throw new ApiClientError(response.status, "REQUEST_FAILED", message);
    }

    return payload as T;
  }

  function isRetryable(requestConfig: RequestConfig, error: unknown): boolean {
    if (requestConfig.retryable !== undefined) return requestConfig.retryable;
    const method = requestConfig.method ?? "GET";
    if (!retryConfig.retryableMethods.includes(method)) return false;
    if (error instanceof ApiClientError) {
      return retryConfig.retryableStatusCodes.includes(error.status);
    }
    // Network-level failure (fetch threw, not an HTTP error response) -- always worth a retry.
    return true;
  }

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

      let attempt = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          return await performSingleRequest<T>(requestConfig);
        } catch (error) {
          if (attempt >= retryConfig.maxRetries || !isRetryable(requestConfig, error)) {
            throw error;
          }
          await sleep(backoffDelayMs(attempt, retryConfig.baseDelayMs));
          attempt += 1;
        }
      }
    },
  };
}
