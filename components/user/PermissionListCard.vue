<script setup lang="ts">
const props = defineProps<{
  permissions: string[];
}>();
</script>

<template>
  <div class="border border-border bg-card text-card-foreground">
    <div class="border-b border-border p-4 pb-2">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          我的权限
        </h3>
        <span class="inline-flex items-center border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground">
          {{ permissions.length }} 项权限
        </span>
      </div>
    </div>
    <div class="p-4 pt-2">
      <div v-if="permissions.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        暂无权限
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <span
          v-for="permission in permissions"
          :key="permission"
          class="inline-flex items-center border border-transparent bg-secondary px-3 py-2 text-[10px] font-semibold tracking-normal text-secondary-foreground"
        >
          {{ permission }}
        </span>
      </div>
    </div>
  </div>
</template>
