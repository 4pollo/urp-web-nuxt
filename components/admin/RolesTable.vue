<script setup lang="ts">
import { computed } from 'vue';
import type { RoleListItem } from '~/lib/types';

interface Props {
  roles: RoleListItem[];
  page: number;
  total: number;
  limit: number;
  pendingRoleId?: number | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true,
  canDelete: true,
});

const emit = defineEmits<{
  pageChange: [page: number];
  edit: [role: RoleListItem];
  delete: [role: RoleListItem];
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));
const start = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.limit + 1);
const end = computed(() => props.total === 0 ? 0 : Math.min(props.page * props.limit, props.total));

const pageNumbers = computed(() => {
  return Array.from(
    { length: totalPages.value },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      Math.abs(pageNumber - props.page) <= 1 ||
      pageNumber === 1 ||
      pageNumber === totalPages.value,
  );
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="border border-border bg-card text-card-foreground">
    <div class="flex flex-col gap-2 border-b border-border p-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        角色列表
      </h3>
      <div class="text-xs uppercase tracking-[0.08em] text-muted-foreground">
        当前显示 {{ start }}-{{ end }} / {{ total }}
      </div>
    </div>
    <div class="p-0">
      <div class="relative w-full overflow-auto">
        <table class="w-full caption-bottom text-sm text-foreground">
          <thead class="[&_tr]:border-b">
            <tr class="border-b border-border transition-colors hover:bg-muted/50">
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                名称
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                描述
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                权限数
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                创建时间
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="[&_tr:last-child]:border-0">
            <tr
              v-for="role in roles"
              :key="role.id"
              class="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td class="px-4 py-3 align-middle text-xs text-foreground">{{ role.name }}</td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">{{ role.description || '-' }}</td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">{{ role.permissionCount }}</td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                {{ formatDate(role.createdAt) }}
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="canEdit"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-border bg-background px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingRoleId === role.id"
                    @click="emit('edit', role)"
                  >
                    编辑
                  </button>
                  <button
                    v-if="canDelete"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-destructive bg-destructive px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingRoleId === role.id"
                    @click="emit('delete', role)"
                  >
                    {{ pendingRoleId === role.id ? '处理中...' : '删除' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-xs uppercase tracking-[0.08em] text-muted-foreground">
          第 {{ page }} / {{ totalPages }} 页
        </div>
        <Pagination class="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                :disabled="page <= 1"
                @click="emit('pageChange', page - 1)"
              />
            </PaginationItem>
            <template v-for="(pageNumber, index) in pageNumbers" :key="pageNumber">
              <PaginationItem v-if="index > 0 && pageNumber - pageNumbers[index - 1] > 1">
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  :is-active="pageNumber === page"
                  @click="emit('pageChange', pageNumber)"
                >
                  {{ pageNumber }}
                </PaginationLink>
              </PaginationItem>
            </template>
            <PaginationItem>
              <PaginationNext
                :disabled="page >= totalPages"
                @click="emit('pageChange', page + 1)"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  </div>
</template>
