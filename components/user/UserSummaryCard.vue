<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  email: string;
  status: string;
  lastLoginAt?: string | null;
}>();

const statusLabel = computed(() => props.status === 'active' ? '正常' : '冻结');
const statusClass = computed(() =>
  props.status === 'active'
    ? 'inline-flex items-center border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground'
    : 'inline-flex items-center border border-transparent bg-destructive px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-destructive-foreground'
);

const formattedLastLogin = computed(() => {
  if (!props.lastLoginAt) return '首次登录';
  return new Date(props.lastLoginAt).toLocaleString('zh-CN');
});
</script>

<template>
  <div class="border border-border bg-card text-card-foreground">
    <div class="border-b border-border p-4 pb-2">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          账户信息
        </h3>
        <span :class="statusClass">
          {{ statusLabel }}
        </span>
      </div>
    </div>
    <div class="space-y-4 p-4 pt-2 text-sm text-foreground">
      <div class="space-y-1">
        <div class="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
          邮箱
        </div>
        <div>{{ email }}</div>
      </div>
      <div class="h-px bg-border" />
      <div class="space-y-1">
        <div class="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
          最后登录
        </div>
        <div>{{ formattedLastLogin }}</div>
      </div>
    </div>
  </div>
</template>
