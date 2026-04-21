<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Search, ShieldCheck, X } from 'lucide-vue-next';
import AppShell from '~/components/layout/AppShell.vue';
import UsersTable from '~/components/admin/UsersTable.vue';
import UserRolesDialog from '~/components/admin/UserRolesDialog.vue';
import ConfirmDialog from '~/components/common/ConfirmDialog.vue';
import AdminStats from '~/components/admin/AdminStats.vue';
import { apiRequest } from '~/lib/fetcher';
import type { UserListItem, UserDetail, RoleListItem } from '~/lib/types';

definePageMeta({
  middleware: 'auth'
});

useHead({
  title: '用户管理 - URP',
});

const router = useRouter();
const toast = useToast();

// 搜索状态
const draftSearch = ref('');
const currentSearch = ref('');
const currentPage = ref(1);
const currentLimit = ref(10);

// 数据状态
const users = ref<{ items: UserListItem[]; total: number; page: number; limit: number } | null>(null);
const availableRoles = ref<RoleListItem[]>([]);
const loading = ref(false);
const rolesLoading = ref(false);

// 对话框状态
const selectedDeleteUser = ref<UserListItem | null>(null);
const selectedRoleUser = ref<UserListItem | null>(null);
const selectedRoleUserDetail = ref<UserDetail | null>(null);
const deletePending = ref(false);
const userDetailLoading = ref(false);
const userRolesSubmitPending = ref(false);
const pendingUserId = ref<number | null>(null);

// 权限（简化版，实际应该从 useCapabilities 获取）
const canUpdateUserStatus = ref(true);
const canAssignUserRoles = ref(true);
const canDeleteUser = ref(true);
const currentUserIsSuperAdmin = ref(false);

// 计算属性
const totals = computed(() => ({
  totalUsers: users.value?.total || 0,
  totalRoles: 0,
  totalPermissions: 0,
}));

// 加载用户列表
async function loadUsers(page: number, limit: number, search: string) {
  loading.value = true;
  try {
    const result = await apiRequest<{ items: UserListItem[]; total: number; page: number; limit: number }>(
      `/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    users.value = result.data;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载用户列表失败');
  } finally {
    loading.value = false;
  }
}

// 加载角色列表
async function loadRoles() {
  rolesLoading.value = true;
  try {
    const result = await apiRequest<{ items: RoleListItem[] }>('/api/roles?page=1&limit=50');
    availableRoles.value = result.data.items;
  } catch (err) {
    console.error('加载角色列表失败:', err);
  } finally {
    rolesLoading.value = false;
  }
}

// 提交搜索
function submitSearch() {
  currentSearch.value = draftSearch.value;
  currentPage.value = 1;
  loadUsers(1, currentLimit.value, draftSearch.value);
}

// 清空搜索
function clearSearch() {
  draftSearch.value = '';
  currentSearch.value = '';
  currentPage.value = 1;
  loadUsers(1, currentLimit.value, '');
}

// 切换用户状态
async function handleToggleUserStatus(user: UserListItem) {
  if (!canUpdateUserStatus.value || pendingUserId.value !== null) return;

  const nextStatus = user.status === 'active' ? 'frozen' : 'active';
  const userIsSuperAdmin = user.roles.some(role => role.name === 'SuperAdmin');

  if (userIsSuperAdmin && nextStatus === 'frozen') {
    toast.error('超级管理员不能冻结自己');
    return;
  }

  pendingUserId.value = user.id;
  try {
    await apiRequest(`/api/users/${user.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    toast.success('用户状态更新成功');
    await loadUsers(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '操作失败');
  } finally {
    pendingUserId.value = null;
  }
}

// 打开角色分配对话框
async function handleUserRolesEdit(user: UserListItem) {
  if (!canAssignUserRoles.value || pendingUserId.value !== null || userDetailLoading.value || deletePending.value) {
    return;
  }

  pendingUserId.value = user.id;
  userDetailLoading.value = true;
  selectedRoleUser.value = user;
  selectedRoleUserDetail.value = null;

  try {
    const result = await apiRequest<UserDetail>(`/api/users/${user.id}`);
    selectedRoleUserDetail.value = result.data;
  } catch (err) {
    selectedRoleUser.value = null;
    selectedRoleUserDetail.value = null;
    toast.error(err instanceof Error ? err.message : '加载用户详情失败');
  } finally {
    userDetailLoading.value = false;
    pendingUserId.value = null;
  }
}

// 提交角色分配
async function handleUserRolesSubmit(roleIds: number[]) {
  if (!canAssignUserRoles.value || !selectedRoleUser.value || userRolesSubmitPending.value) {
    return;
  }

  const superAdminRole = availableRoles.value.find(role => role.name === 'SuperAdmin');
  const keepsSuperAdminRole = !superAdminRole || roleIds.includes(superAdminRole.id);

  if (currentUserIsSuperAdmin.value && !keepsSuperAdminRole) {
    toast.error('超级管理员不能移除自己的超管角色');
    return;
  }

  userRolesSubmitPending.value = true;
  pendingUserId.value = selectedRoleUser.value.id;

  try {
    await apiRequest(`/api/users/${selectedRoleUser.value.id}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
    toast.success('用户角色更新成功');
    selectedRoleUser.value = null;
    selectedRoleUserDetail.value = null;
    await loadUsers(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '更新失败');
  } finally {
    userRolesSubmitPending.value = false;
    pendingUserId.value = null;
  }
}

// 确认删除
async function handleDeleteConfirmed() {
  // 保存引用，防止对话框关闭后被清空
  const userToDelete = selectedDeleteUser.value;

  if (!canDeleteUser.value || !userToDelete || deletePending.value) {
    return;
  }

  deletePending.value = true;
  pendingUserId.value = userToDelete.id;

  try {
    await apiRequest(`/api/users/${userToDelete.id}`, {
      method: 'DELETE',
    });
    toast.success('用户删除成功');
    selectedDeleteUser.value = null;
    await loadUsers(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败');
  } finally {
    deletePending.value = false;
    pendingUserId.value = null;
  }
}

// 页面切换
function handlePageChange(page: number) {
  currentPage.value = page;
  loadUsers(page, currentLimit.value, currentSearch.value);
}

// 对话框打开状态
const deleteDialogOpen = computed({
  get: () => !!selectedDeleteUser.value,
  set: (value) => { if (!value) selectedDeleteUser.value = null; }
});

const rolesDialogOpen = computed({
  get: () => !!selectedRoleUser.value,
  set: (value) => {
    if (!value) {
      selectedRoleUser.value = null;
      selectedRoleUserDetail.value = null;
    }
  }
});

// 初始化
onMounted(() => {
  loadUsers(currentPage.value, currentLimit.value, currentSearch.value);
  loadRoles();
});
</script>

<template>
  <AppShell
    :header-center="true"
  >
    <template #headerCenter>
      <div class="flex w-full max-w-md flex-col gap-3 lg:flex-row lg:items-center lg:justify-center">
        <div class="w-full max-w-sm flex-1">
          <InputGroup class="border-border !h-9">
            <InputGroupAddon class="pl-4 pr-0 !h-9">
              <Search :size="16" />
            </InputGroupAddon>
            <InputGroupInput
              v-model="draftSearch"
              placeholder="搜索邮箱..."
              class="!h-9 !py-2"
              @keydown.enter.prevent="submitSearch"
            />
            <button
              v-if="draftSearch"
              type="button"
              class="inline-flex h-9 items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="清空搜索"
              @click="clearSearch"
            >
              <X :size="16" />
            </button>
          </InputGroup>
        </div>
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center whitespace-nowrap border border-border bg-background px-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          @click="submitSearch"
        >
          搜索
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0 flex-1">
          <h1 class="page-title">用户管理</h1>
          <p class="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
            管理系统用户、状态与分页列表
          </p>
        </div>
        <div class="inline-flex items-center gap-1.5 self-start border border-border bg-transparent px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground lg:self-auto">
          <ShieldCheck :size="14" />
          {{ totals.totalUsers }} 用户
        </div>
      </div>

      <AdminStats
        :total-users="totals.totalUsers"
        :total-roles="totals.totalRoles"
        :total-permissions="totals.totalPermissions"
      />

      <div v-if="loading && !users" class="text-center py-12">
        <p class="text-sm text-muted-foreground">正在加载用户数据...</p>
      </div>

      <div v-else-if="users && users.items.length > 0">
        <UsersTable
          :users="users.items"
          :page="users.page"
          :total="users.total"
          :limit="users.limit"
          :pending-user-id="pendingUserId"
          :can-toggle-status="canUpdateUserStatus"
          :can-assign-roles="canAssignUserRoles"
          :can-delete="canDeleteUser"
          @page-change="handlePageChange"
          @toggle-status="handleToggleUserStatus"
          @assign-roles="handleUserRolesEdit"
          @delete="(user) => {
            if (!canDeleteUser || pendingUserId !== null || selectedRoleUser) return;
            selectedDeleteUser = user;
          }"
        />
      </div>

      <div v-else class="text-center py-12 border border-border bg-card">
        <p class="text-sm text-muted-foreground">暂无用户</p>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :pending="deletePending"
      title="确认操作"
      :description="selectedDeleteUser ? `确定要删除用户 &quot;${selectedDeleteUser.email}&quot; 吗？此操作不可恢复。` : '确定要继续吗？'"
      confirm-label="确认"
      @confirm="handleDeleteConfirmed"
    />

    <!-- 用户角色分配对话框 -->
    <UserRolesDialog
      v-model:open="rolesDialogOpen"
      :user="selectedRoleUser"
      :user-detail="selectedRoleUserDetail"
      :roles="availableRoles"
      :detail-loading="userDetailLoading"
      :pending="userRolesSubmitPending"
      :read-only="!canAssignUserRoles"
      :current-user-is-super-admin="currentUserIsSuperAdmin"
      :editing-self="false"
      @submit="handleUserRolesSubmit"
    />
  </AppShell>
</template>
