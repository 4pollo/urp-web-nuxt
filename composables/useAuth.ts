import { ref } from 'vue';
import { login, logout as logoutRequest, register } from '~/lib/auth';
import {
  destroySession,
  getInitialUser,
  hasSession,
  hydrateSession,
} from '~/lib/session';
import type { AuthUser } from '~/lib/types';

export function useAuth() {
  const user = ref<AuthUser | null>(getInitialUser());
  const isAuthenticated = ref(hasSession());
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    isSubmitting.value = true;
    error.value = null;
    try {
      await login(email.trim(), password);
      const session = await hydrateSession();
      user.value = session.user;
      isAuthenticated.value = true;
      return session;
    } catch (err) {
      destroySession();
      user.value = null;
      isAuthenticated.value = false;
      const message = err instanceof Error ? err.message : '登录失败';
      error.value = message;
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    isSubmitting.value = true;
    error.value = null;
    try {
      await register(email.trim(), password);
      const session = await hydrateSession();
      user.value = session.user;
      isAuthenticated.value = true;
      return session;
    } catch (err) {
      destroySession();
      user.value = null;
      isAuthenticated.value = false;
      const message = err instanceof Error ? err.message : '注册失败';
      error.value = message;
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  };

  const logout = async () => {
    await logoutRequest();
    user.value = null;
    isAuthenticated.value = false;
  };

  const setUser = (newUser: AuthUser | null) => {
    user.value = newUser;
  };

  const setError = (newError: string | null) => {
    error.value = newError;
  };

  return {
    user,
    isAuthenticated,
    isSubmitting,
    error,
    setError,
    setUser,
    login: handleLogin,
    register: handleRegister,
    logout,
  };
}
