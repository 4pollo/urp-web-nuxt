import { computed } from 'vue';
import { usePermissionsStore } from '~/stores/permissions';

export function useMyPermissions(enabled = true) {
  const permissionsStore = usePermissionsStore();

  return {
    roles: computed(() => enabled ? permissionsStore.roles : []),
    permissions: computed(() => enabled ? permissionsStore.permissions : []),
    loading: computed(() => enabled ? permissionsStore.loading : false),
    error: computed(() => enabled ? permissionsStore.error : null),
    reload: enabled ? permissionsStore.reload : async () => {},
  };
}
