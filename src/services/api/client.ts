const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://societyhub-backend-production.up.railway.app/v1';
const API_ORIGIN = API_BASE_URL.replace(/\/v1\/?$/, '');
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL ?? API_ORIGIN;
let authAccessToken: string | null = null;
const DEBUG_API = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

/** Long enough for a slow campus network, short enough to not feel hung. */
const REQUEST_TIMEOUT_MS = 15_000;
/** 408 Request Timeout — lets callers treat it as a normal transport failure. */
const REQUEST_TIMEOUT_STATUS = 408;

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  requestId?: string;

  constructor(message: string, statusCode: number, code?: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.requestId = requestId;
  }
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  requiresAdmin?: boolean;
  societyId?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requiresAdmin, societyId } = options;
  const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': clientRequestId,
  };

  if (authAccessToken) {
    headers.Authorization = `Bearer ${authAccessToken}`;
  }

  // Add admin context headers if required
  if (requiresAdmin && societyId) {
    headers['x-admin-society-id'] = societyId;
  }

  if (DEBUG_API) {
    console.log('[API] ->', method, url, { requestId: clientRequestId, body });
  }

  // Without a timeout a dead network (captive portal, no signal) leaves the
  // promise pending for the platform default — which is why loading skeletons
  // could spin forever with no way out. Abort and surface it as a real error.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'That took too long. Check your connection and try again.',
        REQUEST_TIMEOUT_STATUS,
        'REQUEST_TIMEOUT',
        clientRequestId,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (DEBUG_API) {
    console.log('[API] <-', method, url, { status: response.status, requestId: response.headers.get('x-request-id') ?? clientRequestId });
  }

  if (!response.ok) {
    const requestId = response.headers.get('x-request-id') ?? undefined;
    const errorText = await response.text();
    if (DEBUG_API) {
      console.warn('[API] !!', method, url, { status: response.status, requestId, errorText });
    }

    // Parse first, throw after. Throwing inside the `try` would be caught by its
    // own `catch` and re-thrown without `code`, which silently breaks every
    // code-driven error path (USERNAME_TAKEN, INVALID_CREDENTIALS, ...).
    type ParsedApiError = { message?: string | string[]; code?: string; statusCode?: number };
    let parsed: ParsedApiError | null = null;
    try {
      parsed = JSON.parse(errorText) as ParsedApiError;
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === 'object') {
      const message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      throw new ApiError(
        message || `API request failed with status ${response.status}`,
        parsed.statusCode ?? response.status,
        parsed.code,
        requestId,
      );
    }

    throw new ApiError(
      errorText || `API request failed with status ${response.status}`,
      response.status,
      undefined,
      requestId,
    );
  }

  return (await response.json()) as T;
}

export function setApiAccessToken(token: string | null) {
  authAccessToken = token;
}

export { API_BASE_URL, API_ORIGIN, WS_BASE_URL };
