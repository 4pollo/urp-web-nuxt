<template>
  <div>
    <NuxtPage />
    <Toaster position="top-center" rich-colors />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import { usePermissionsStore } from '~/stores/permissions';

const permissionsStore = usePermissionsStore();

// 初始化权限
if (import.meta.client) {
  permissionsStore.loadPermissions();
}
</script>
