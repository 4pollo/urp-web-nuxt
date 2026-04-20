<script setup lang="ts">
import { computed } from 'vue';
import type { PermissionItem } from '~/lib/types';

interface Props {
  permissions: PermissionItem[];
  page: number;
  total: number;
  limit: number;
  pendingPermissionId?: number | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true,
  canDelete: true,
});

const emit = defineEmits<{
  pageChange: [page: number];
  edit: [permission: PermissionItem];
  delete: [permission: PermissionItem];
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
</script>

<template>
  <div class="border border-border bg-card text-card-foreground">
    <div class="flex flex-col gap-2 border-b border-border p-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        权限列表
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
                标识
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                分组
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                描述
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="[&_tr:last-child]:border-0">
            <tr
              v-for="permission in permissions"
              :key="permission.id"
              class="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                {{ permission.key }}
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                {{ permission.group }}
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                {{ permission.description || '-' }}
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="canEdit"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-border bg-background px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingPermissionId === permission.id"
                    @click="emit('edit', permission)"
                  >
                    编辑
                  </button>
                  <button
                    v-if="canDelete"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-destructive bg-destructive px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingPermissionId === permission.id"
                    @click="emit('delete', permission)"
                  >
                    {{ pendingPermissionId === permission.id ? '处理中...' : '删除' }}
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
