/**
 * Default timeout applied to API requests when none is provided explicitly.
 */
export const DEFAULT_TIMEOUT_MS = 10000;

export interface ApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface ApiRequestOptions {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ApiClient {
  request: <TResponse>(options: ApiRequestOptions) => Promise<TResponse>;
}

/**
 * Resolves the base URL used for API calls, falling back to sensible defaults.
 */
export const resolveApiBaseUrl = (override?: string): string => {
  const raw = override ?? import.meta.env.VITE_API_BASE_URL ?? import.meta.env.API_BASE_URL ?? 'http://localhost:4000';
  return raw.replace(/\/$/, '');
};

/**
 * Constructs an absolute API URL while preserving a single slash separator.
 */
export const buildApiUrl = (baseUrl: string, path: string): string => {
  const sanitizedBase = baseUrl.replace(/\/$/, '');
  const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${sanitizedBase}/${sanitizedPath}`;
};

/**
 * Creates a lightweight fetch-based API client that enforces JSON communication.
 */
export const createApiClient = (options: ApiClientOptions = {}): ApiClient => {
  const baseUrl = resolveApiBaseUrl(options.baseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  const request: ApiClient['request'] = async <TResponse>({
    path,
    method = 'GET',
    body,
    headers = {},
    signal,
  }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortHandler = () => controller.abort();
    signal?.addEventListener('abort', abortHandler, { once: true });

    try {
      const response = await fetchImpl(buildApiUrl(baseUrl, path), {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API request failed with ${response.status}: ${text}`);
      }

      if (response.status === 204) {
        return undefined as unknown as TResponse;
      }

      return (await response.json()) as TResponse;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abortHandler);
    }
  };

  return { request };
};
