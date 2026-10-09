// =============================================================================
// lib/api/client.ts — Base HTTP Client
// =============================================================================
// This is the SINGLE place that knows where the backend lives.
// All fetch() calls go through this client — never use raw fetch() in
// components or call the API URL directly.
//
// The base URL is read from NEXT_PUBLIC_API_BASE_URL at build time.
// Local dev:   http://localhost:8000/api  (set in .env.local)
// Production:  https://api.yourdomain.com/api  (set in CI/CD environment)
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. " +
      "Create a .env.local file with: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api"
  );
}

// ---------------------------------------------------------------------------
// Error type — provides structured error information from the API
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly detail?: string
  ) {
    super(detail ?? `HTTP ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Internal helper — wraps fetch with consistent error handling
// ---------------------------------------------------------------------------
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  // 204 No Content — delete returns no body
  if (response.status === 204) {
    return undefined as T;
  }

  // Parse JSON for all other responses
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      data?.detail ?? data?.message ?? "Unknown error"
    );
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Public API — typed convenience wrappers around the raw request helper
// ---------------------------------------------------------------------------

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  delete: (path: string) => request<void>(path, { method: "DELETE" }),
};
