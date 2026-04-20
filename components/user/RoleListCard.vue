<script setup lang="ts">
const props = defineProps<{
  roles: Array<{ id: number; name: string }>;
}>();
</script>

<template>
  <div class="border border-border bg-card text-card-foreground">
    <div class="border-b border-border p-4 pb-2">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          角色信息
        </h3>
        <span class="inline-flex items-center border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground">
          {{ roles.length }} 个角色
        </span>
      </div>
    </div>
    <div class="p-4 pt-2">
      <div v-if="roles.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        暂无角色
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <span
          v-for="role in roles"
          :key="role.id"
          class="inline-flex items-center border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground"
        >
          {{ role.name }}
        </span>
      </div>
    </div>
  </div>
</template>
