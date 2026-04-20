import { computed } from 'vue';
import { getCapabilities } from '~/lib/capabilities';
import { usePermissionsStore } from '~/stores/permissions';

export function useCapabilities(enabled = true) {
  const permissionsStore = usePermissionsStore();

  const capabilities = computed(() =>
    getCapabilities(
      enabled ? permissionsStore.permissions : [],
      enabled ? permissionsStore.roles : []
    )
  );

  return {
    roles: computed(() => enabled ? permissionsStore.roles : []),
    permissions: computed(() => enabled ? permissionsStore.permissions : []),
    loading: computed(() => enabled ? permissionsStore.loading : false),
    error: computed(() => enabled ? permissionsStore.error : null),
    reload: enabled ? permissionsStore.reload : async () => {},
    capabilities,
  };
}
