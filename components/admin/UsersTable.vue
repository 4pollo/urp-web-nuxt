<script setup lang="ts">
import { computed } from 'vue';
import type { UserListItem } from '~/lib/types';

interface Props {
  users: UserListItem[];
  page: number;
  total: number;
  limit: number;
  pendingUserId?: number | null;
  canToggleStatus?: boolean;
  canAssignRoles?: boolean;
  canDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canToggleStatus: true,
  canAssignRoles: true,
  canDelete: true,
});

const emit = defineEmits<{
  pageChange: [page: number];
  toggleStatus: [user: UserListItem];
  assignRoles: [user: UserListItem];
  delete: [user: UserListItem];
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

function formatDate(dateString: string | null) {
  if (!dateString) return '首次登录';
  return new Date(dateString).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="border border-border bg-card text-card-foreground">
    <div class="flex flex-col gap-2 border-b border-border p-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        用户列表
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
                邮箱
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                状态
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                角色
              </th>
              <th class="h-12 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                最后登录
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
              v-for="user in users"
              :key="user.id"
              class="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td class="px-4 py-3 align-middle text-xs text-foreground">{{ user.email }}</td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                <span
                  :class="user.status === 'active'
                    ? 'inline-flex items-center border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground'
                    : 'inline-flex items-center border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground'"
                >
                  {{ user.status === 'active' ? '正常' : '冻结' }}
                </span>
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="role in user.roles"
                    :key="role.id"
                    class="inline-flex items-center border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground"
                  >
                    {{ role.name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                {{ formatDate(user.lastLoginAt) }}
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-4 py-3 align-middle text-xs text-foreground">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="canToggleStatus"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-border bg-background px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingUserId === user.id"
                    @click="emit('toggleStatus', user)"
                  >
                    {{ pendingUserId === user.id ? '处理中...' : (user.status === 'active' ? '冻结' : '激活') }}
                  </button>
                  <button
                    v-if="canAssignRoles"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-border bg-background px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingUserId === user.id"
                    @click="emit('assignRoles', user)"
                  >
                    分配角色
                  </button>
                  <button
                    v-if="canDelete"
                    type="button"
                    class="inline-flex h-8 items-center justify-center whitespace-nowrap border border-destructive bg-destructive px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    :disabled="pendingUserId === user.id"
                    @click="emit('delete', user)"
                  >
                    删除
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
