import { ref, onMounted } from 'vue';
import { getCurrentUser } from '~/lib/auth';
import type { AuthUser } from '~/lib/types';

export function useCurrentUser(enabled = true) {
  const user = ref<AuthUser | null>(null);
  const loading = ref(enabled);
  const error = ref<string | null>(null);

  const reload = async () => {
    if (!enabled) {
      loading.value = false;
      return;
    }

    loading.value = true;
    try {
      const nextUser = await getCurrentUser();
      user.value = nextUser;
      error.value = null;
    } catch (err) {
      user.value = null;
      error.value = err instanceof Error ? err.message : '获取用户失败';
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    reload();
  });

  const setUser = (newUser: AuthUser | null) => {
    user.value = newUser;
  };

  return { user, setUser, loading, error, reload };
}
