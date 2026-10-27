export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000")
).replace(/\/+$/, "");
type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; refresh?: boolean };
type ApiEnvelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
};

/** Cookie-session transport. Credentials never enter browser storage. */
export function createApiClient(baseUrl: string, fetcher: typeof fetch = fetch) {
  let csrf: string | null = null;
  let csrfRequest: Promise<string> | null = null;
  let refreshRequest: Promise<void> | null = null;
  let identityVersion = 0;

  async function send(path: string, options: RequestInit = {}) {
    if (!baseUrl)
      throw new ApiError("This service is not available yet. Please try again later.");
    try {
      return await fetcher(baseUrl + path, {
        ...options,
        credentials: "include",
        cache: "no-store",
        signal: options.signal ?? AbortSignal.timeout(20_000),
      });
    } catch (error) {
      if (options.signal?.aborted) throw error;
      throw new ApiError(
        "We could not connect. Please try again. Your details have not been cleared.",
      );
    }
  }
  async function ensureCsrf(): Promise<string> {
    if (csrf) return csrf;
    if (!csrfRequest) {
      csrfRequest = (async () => {
        const response = await send("/api/auth/csrf-token");
        const payload = await response.json();
        if (!response.ok || typeof payload?.data?.csrfToken !== "string") {
          throw new ApiError(
            "We could not start a secure session. Please try again.",
            response.status,
          );
        }
        csrf = payload.data.csrfToken;
        return csrf!;
      })().finally(() => {
        csrfRequest = null;
      });
    }
    return csrfRequest;
  }
  async function refreshSession() {
    if (!refreshRequest) {
      const refresh = async () => {
        await request("/api/auth/refresh", { method: "POST", body: {}, refresh: false });
      };
      refreshRequest = (async () => {
        if (typeof navigator !== "undefined" && navigator.locks)
          await navigator.locks.request("albumo-session-refresh", refresh);
        else await refresh();
      })().finally(() => {
        refreshRequest = null;
      });
    }
    return refreshRequest;
  }
  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiEnvelope<T>> {
    if (!path.startsWith("/api/") || path.includes("://"))
      throw new ApiError("Invalid API path.");
    const { body, refresh = true, ...init } = options;
    const version = identityVersion;
    const method = (init.method ?? "GET").toUpperCase();
    const mutating = !["GET", "HEAD", "OPTIONS"].includes(method);
    let retriedCsrf = false;
    let retriedAuth = false;
    while (true) {
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (body !== undefined) headers.set("Content-Type", "application/json");
      if (mutating) headers.set("x-csrf-token", await ensureCsrf());
      const response = await send(path, {
        ...init,
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      let payload: ApiEnvelope<T>;
      try {
        payload = await response.json();
      } catch {
        throw new ApiError(
          "The service returned an unexpected response. Please try again.",
          response.status,
        );
      }
      if (response.status === 403 && payload.code?.startsWith("CSRF_") && !retriedCsrf) {
        retriedCsrf = true;
        csrf = null;
        continue;
      }
      if (
        response.status === 401 &&
        refresh &&
        !retriedAuth &&
        !/^\/api\/auth\/(?!me(?:$|\?))/.test(path)
      ) {
        retriedAuth = true;
        try {
          await refreshSession();
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.status === 401 &&
            version === identityVersion &&
            typeof window !== "undefined"
          ) {
            window.dispatchEvent(new Event("albumo-session-expired"));
          }
          throw error;
        }
        if (version !== identityVersion)
          throw new ApiError("Your session changed. Please try again.", 401);
        continue;
      }
      if (!response.ok || payload.success === false) {
        throw new ApiError(
          payload.error || "Your request could not be completed.",
          response.status,
          payload.code,
          payload.data,
        );
      }
      return payload;
    }
  }
  return {
    request,
    get: async <T>(path: string, options?: RequestOptions) =>
      (await request<T>(path, options)).data,
    post: async <T>(path: string, body: unknown = {}, options?: RequestOptions) =>
      (await request<T>(path, { ...options, method: "POST", body })).data,
    patch: async <T>(path: string, body: unknown) =>
      (await request<T>(path, { method: "PATCH", body })).data,
    identityChanged: () => {
      identityVersion += 1;
    },
  };
}
export const api = createApiClient(API_BASE_URL);
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
