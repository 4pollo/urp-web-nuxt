const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const PERMISSIONS_KEY = 'permissions';
const PERMISSIONS_CACHE_DURATION = 30 * 60 * 1000;

function canUseStorage() {
  return import.meta.client && typeof window !== 'undefined';
}

export type StoredUser = {
  id: number;
  email: string;
  status: string;
};

export type StoredPermissions = {
  roles: string[];
  permissions: string[];
  cachedAt: number;
};

export function getAccessToken() {
  return canUseStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function getRefreshToken() {
  return canUseStorage()
    ? window.localStorage.getItem(REFRESH_TOKEN_KEY)
    : null;
}

export function getStoredUser(): StoredUser | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setSession(session: {
  accessToken?: string;
  refreshToken?: string;
  user?: StoredUser;
}) {
  if (!canUseStorage()) return;

  if (session.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  }

  if (session.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }

  if (session.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function clearSession() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(PERMISSIONS_KEY);
}

export function getCachedPermissions(): StoredPermissions | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(PERMISSIONS_KEY);
  if (!raw) return null;

  try {
    const cached = JSON.parse(raw) as StoredPermissions;
    const now = Date.now();
    if (now - cached.cachedAt > PERMISSIONS_CACHE_DURATION) {
      window.localStorage.removeItem(PERMISSIONS_KEY);
      return null;
    }
    return cached;
  } catch {
    window.localStorage.removeItem(PERMISSIONS_KEY);
    return null;
  }
}

export function setCachedPermissions(permissions: {
  roles: string[];
  permissions: string[];
}) {
  if (!canUseStorage()) return;

  const data: StoredPermissions = {
    ...permissions,
    cachedAt: Date.now(),
  };
  window.localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(data));
}
