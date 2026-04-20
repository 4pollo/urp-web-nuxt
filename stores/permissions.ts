import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMyPermissions } from '~/lib/auth';
import { getCachedPermissions, setCachedPermissions } from '~/lib/storage';

export const usePermissionsStore = defineStore('permissions', () => {
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const loadPermissions = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedPermissions();
      if (cached) {
        roles.value = cached.roles;
        permissions.value = cached.permissions;
        loading.value = false;
        return;
      }
    }

    loading.value = true;
    try {
      const result = await getMyPermissions();
      roles.value = result.roles || [];
      permissions.value = result.permissions || [];
      setCachedPermissions({ roles: result.roles || [], permissions: result.permissions || [] });
      error.value = null;
    } catch (err) {
      roles.value = [];
      permissions.value = [];
      error.value = err instanceof Error ? err.message : '获取权限失败';
    } finally {
      loading.value = false;
    }
  };

  const reload = async () => {
    await loadPermissions(true);
  };

  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission);
  };

  const hasRole = (role: string) => {
    return roles.value.includes(role);
  };

  return {
    roles,
    permissions,
    loading,
    error,
    loadPermissions,
    reload,
    hasPermission,
    hasRole,
  };
});
