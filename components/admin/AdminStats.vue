<script setup lang="ts">
const props = defineProps<{
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
}>();

const items = computed(() => [
  { label: '总用户数', value: props.totalUsers, index: '01' },
  { label: '总角色数', value: props.totalRoles, index: '02' },
  { label: '总权限数', value: props.totalPermissions, index: '03' },
]);
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <div
      v-for="item in items"
      :key="item.label"
      class="border border-border bg-card text-card-foreground"
    >
      <div class="flex flex-row items-start justify-between border-b border-border p-4 pb-4">
        <div class="space-y-1">
          <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {{ item.label }}
          </h3>
          <p class="text-xs text-muted-foreground">当前系统统计</p>
        </div>
        <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {{ item.index }}
        </span>
      </div>
      <div class="p-4 pt-4">
        <div class="text-[40px] font-extrabold leading-none tracking-[-0.02em] text-foreground">
          {{ item.value }}
        </div>
      </div>
    </div>
  </div>
</template>
