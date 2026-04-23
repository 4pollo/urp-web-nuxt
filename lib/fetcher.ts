import { env } from './env';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
} from './storage';
import type { ApiResponse, AuthPayload } from './types';

export class ApiError extends Error {
  code: number;
  status: number;

  constructor(message: string, code = 5000, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** 触发了后端限流（HTTP 429） */
export class RateLimitedError extends ApiError {
  /** 服务器建议的最早重试时间点（毫秒时间戳），如不可知则为 null */
  retryAt: number | null;

  constructor(message: string, retryAt: number | null, status = 429) {
    super(message, 4029, status);
    this.name = 'RateLimitedError';
    this.retryAt = retryAt;
  }
}

/** 账号因连续失败被临时锁定 */
export class AccountLockedError extends ApiError {
  constructor(message: string, status = 401) {
    super(message, 4001, status);
    this.name = 'AccountLockedError';
  }
}

const ACCOUNT_LOCKED_MARKER = 'Account temporarily locked';
const ACCOUNT_LOCKED_FRIENDLY =
  '账号因多次登录失败已被临时锁定，请 15 分钟后再试';
const RATE_LIMITED_FRIENDLY = '操作过于频繁，请稍后再试';

function isAccountLockedMessage(message: string | undefined): boolean {
  return !!message && message.includes(ACCOUNT_LOCKED_MARKER);
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Date.now() + seconds * 1000;
  }
  const date = Date.parse(header);
  return Number.isFinite(date) ? date : null;
}

function buildRateLimitedMessage(retryAt: number | null): string {
  if (!retryAt) return RATE_LIMITED_FRIENDLY;
  const waitSeconds = Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));
  if (waitSeconds < 60) return `操作过于频繁，请 ${waitSeconds} 秒后再试`;
  const waitMinutes = Math.ceil(waitSeconds / 60);
  return `操作过于频繁，请 ${waitMinutes} 分钟后再试`;
}

function apiUrl(path: string) {
  return `${env.apiBaseUrl}${path}`;
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    throw new ApiError('服务返回了空响应', 5000, response.status);
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('服务返回了无效响应', 5000, response.status);
  }
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await parseJson<T>(response);

  if (result.code !== 0) {
    throw new ApiError(
      result.message || 'Request failed',
      result.code,
      response.status,
    );
  }

  return result;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    throw new ApiError('登录状态已失效', 4001, 401);
  }

  const response = await fetch(apiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const result = await parseResponse<{
    accessToken: string;
    refreshToken: string;
  }>(response);
  const currentUser = getStoredUser();

  setSession({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    user: currentUser || undefined,
  });

  return result.data.accessToken;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { auth?: boolean; retry?: boolean } = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers || {});
  const token = init.auth === false ? null : getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 429) {
    const retryAt = parseRetryAfter(response.headers.get('Retry-After'));
    throw new RateLimitedError(buildRateLimitedMessage(retryAt), retryAt);
  }

  const result = await parseJson<T>(response);

  if (result.code === 0) {
    return result;
  }

  if (response.status === 401 && isAccountLockedMessage(result.message)) {
    throw new AccountLockedError(ACCOUNT_LOCKED_FRIENDLY, response.status);
  }

  if (result.code === 4001 && init.auth !== false && init.retry !== false) {
    try {
      const refreshedToken = await refreshAccessToken();
      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
      if (init.body && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      const retryResponse = await fetch(apiUrl(path), {
        ...init,
        headers: retryHeaders,
      });

      if (retryResponse.status === 429) {
        const retryAt = parseRetryAfter(retryResponse.headers.get('Retry-After'));
        throw new RateLimitedError(buildRateLimitedMessage(retryAt), retryAt);
      }

      return parseResponse<T>(retryResponse);
    } catch (err) {
      if (err instanceof RateLimitedError || err instanceof AccountLockedError) {
        throw err;
      }
      clearSession();
      throw new ApiError('登录状态已失效', 4001, 401);
    }
  }

  throw new ApiError(
    result.message || 'Request failed',
    result.code,
    response.status,
  );
}

export async function authRequest(
  path: '/api/auth/login' | '/api/auth/register',
  payload: { email: string; password: string },
) {
  const result = await apiRequest<AuthPayload>(path, {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });

  setSession({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    user: result.data.user,
  });

  return result.data;
}
