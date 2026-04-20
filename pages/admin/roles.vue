<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Shield, X, Plus } from 'lucide-vue-next';
import AppShell from '~/components/layout/AppShell.vue';
import RolesTable from '~/components/admin/RolesTable.vue';
import RoleEditDialog from '~/components/admin/RoleEditDialog.vue';
import ConfirmDialog from '~/components/common/ConfirmDialog.vue';
import AdminStats from '~/components/admin/AdminStats.vue';
import InputGroup from '~/components/ui/InputGroup.vue';
import InputGroupInput from '~/components/ui/InputGroupInput.vue';
import InputGroupAddon from '~/components/ui/InputGroupAddon.vue';
import { apiRequest } from '~/lib/fetcher';
import { navItems } from '~/lib/capabilities';
import type { RoleListItem, RoleDetail, PermissionItem } from '~/lib/types';

definePageMeta({
  middleware: 'auth'
});

useHead({
  title: '角色管理 - URP',
});

const toast = useToast();

// 搜索状态
const draftSearch = ref('');
const currentSearch = ref('');
const currentPage = ref(1);
const currentLimit = ref(10);

// 数据状态
const roles = ref<{ items: RoleListItem[]; total: number; page: number; limit: number } | null>(null);
const permissions = ref<PermissionItem[]>([]);
const loading = ref(false);
const permissionsLoading = ref(false);

// 对话框状态
const selectedDeleteRole = ref<RoleListItem | null>(null);
const selectedEditRole = ref<RoleListItem | null>(null);
const selectedRoleDetail = ref<RoleDetail | null>(null);
const editMode = ref<'create' | 'edit'>('edit');
const deletePending = ref(false);
const roleDetailLoading = ref(false);
const rolePending = ref(false);
const permissionPending = ref(false);
const pendingRoleId = ref<number | null>(null);

// 权限
const canCreateRole = ref(true);
const canUpdateRole = ref(true);
const canDeleteRole = ref(true);
const canEditPermissions = ref(true);

// 计算属性
const totals = computed(() => ({
  totalUsers: 0,
  totalRoles: roles.value?.total || 0,
  totalPermissions: 0,
}));

// 加载角色列表
async function loadRoles(page: number, limit: number, search: string) {
  loading.value = true;
  try {
    const result = await apiRequest<{ items: RoleListItem[]; total: number; page: number; limit: number }>(
      `/api/roles?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    roles.value = result.data;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载角色列表失败');
  } finally {
    loading.value = false;
  }
}

// 加载权限列表
async function loadPermissions() {
  permissionsLoading.value = true;
  try {
    const result = await apiRequest<{ items: PermissionItem[] }>('/api/permissions?page=1&limit=50');
    permissions.value = result.data.items;
  } catch (err) {
    console.error('加载权限列表失败:', err);
  } finally {
    permissionsLoading.value = false;
  }
}

// 提交搜索
function submitSearch() {
  currentSearch.value = draftSearch.value;
  currentPage.value = 1;
  loadRoles(1, currentLimit.value, draftSearch.value);
}

// 清空搜索
function clearSearch() {
  draftSearch.value = '';
  currentSearch.value = '';
  currentPage.value = 1;
  loadRoles(1, currentLimit.value, '');
}

// 打开创建对话框
function handleRoleCreate() {
  if (!canCreateRole.value || pendingRoleId.value !== null || roleDetailLoading.value || deletePending.value) {
    return;
  }

  selectedEditRole.value = {} as RoleListItem;
  selectedRoleDetail.value = null;
  editMode.value = 'create';
}

// 打开编辑对话框
async function handleRoleEdit(role: RoleListItem) {
  if (!canUpdateRole.value || pendingRoleId.value !== null || roleDetailLoading.value || deletePending.value) {
    return;
  }

  pendingRoleId.value = role.id;
  roleDetailLoading.value = true;
  selectedEditRole.value = role;
  selectedRoleDetail.value = null;
  editMode.value = 'edit';

  try {
    const result = await apiRequest<RoleDetail>(`/api/roles/${role.id}`);
    selectedRoleDetail.value = result.data;
  } catch (err) {
    selectedEditRole.value = null;
    selectedRoleDetail.value = null;
    toast.error(err instanceof Error ? err.message : '加载角色详情失败');
  } finally {
    roleDetailLoading.value = false;
    pendingRoleId.value = null;
  }
}

// 提交角色基础信息
async function handleRoleSubmit(payload: { name: string; description: string }) {
  if (!selectedEditRole.value || rolePending.value) return;

  rolePending.value = true;
  if (editMode.value === 'edit') {
    pendingRoleId.value = selectedEditRole.value.id;
  }

  try {
    if (editMode.value === 'create') {
      await apiRequest('/api/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('角色创建成功');
      selectedEditRole.value = null;
      selectedRoleDetail.value = null;
    } else {
      await apiRequest(`/api/roles/${selectedEditRole.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      toast.success('角色信息更新成功');
    }
    await loadRoles(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : editMode.value === 'create' ? '创建失败' : '更新失败');
  } finally {
    rolePending.value = false;
    pendingRoleId.value = null;
  }
}

// 提交角色权限
async function handlePermissionsSubmit(permissionIds: number[]) {
  if (!selectedEditRole.value || permissionPending.value) return;

  permissionPending.value = true;
  pendingRoleId.value = selectedEditRole.value.id;

  try {
    await apiRequest(`/api/roles/${selectedEditRole.value.id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    });
    toast.success('角色权限更新成功');

    // 重新加载角色详情
    const result = await apiRequest<RoleDetail>(`/api/roles/${selectedEditRole.value.id}`);
    selectedRoleDetail.value = result.data;

    await loadRoles(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '更新失败');
  } finally {
    permissionPending.value = false;
    pendingRoleId.value = null;
  }
}

// 确认删除
async function handleDeleteConfirmed() {
  if (!canDeleteRole.value || !selectedDeleteRole.value || deletePending.value) {
    return;
  }

  deletePending.value = true;
  pendingRoleId.value = selectedDeleteRole.value.id;

  try {
    await apiRequest(`/api/roles/${selectedDeleteRole.value.id}`, {
      method: 'DELETE',
    });
    toast.success('角色删除成功');
    selectedDeleteRole.value = null;
    await loadRoles(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败');
  } finally {
    deletePending.value = false;
    pendingRoleId.value = null;
  }
}

// 页面切换
function handlePageChange(page: number) {
  currentPage.value = page;
  loadRoles(page, currentLimit.value, currentSearch.value);
}

// 对话框打开状态
const deleteDialogOpen = computed({
  get: () => !!selectedDeleteRole.value,
  set: (value) => { if (!value) selectedDeleteRole.value = null; }
});

const editDialogOpen = computed({
  get: () => !!selectedEditRole.value,
  set: (value) => {
    if (!value) {
      selectedEditRole.value = null;
      selectedRoleDetail.value = null;
    }
  }
});

// 初始化
onMounted(() => {
  loadRoles(currentPage.value, currentLimit.value, currentSearch.value);
  loadPermissions();
});
</script>

<template>
  <AppShell
    :nav-items="navItems"
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
              placeholder="搜索角色..."
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
          <h1 class="page-title">角色管理</h1>
          <p class="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
            管理系统角色与权限分配
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="canCreateRole"
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap border border-primary bg-primary px-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            @click="handleRoleCreate"
          >
            <Plus :size="16" />
            新建角色
          </button>
        </div>
      </div>

      <AdminStats
        :total-users="totals.totalUsers"
        :total-roles="totals.totalRoles"
        :total-permissions="totals.totalPermissions"
      />

      <div v-if="loading && !roles" class="text-center py-12">
        <p class="text-sm text-muted-foreground">正在加载角色数据...</p>
      </div>

      <div v-else-if="roles && roles.items.length > 0">
        <RolesTable
          :roles="roles.items"
          :page="roles.page"
          :total="roles.total"
          :limit="roles.limit"
          :pending-role-id="pendingRoleId"
          :can-edit="canUpdateRole"
          :can-delete="canDeleteRole"
          @page-change="handlePageChange"
          @edit="handleRoleEdit"
          @delete="(role) => {
            if (!canDeleteRole || pendingRoleId !== null || selectedEditRole) return;
            selectedDeleteRole = role;
          }"
        />
      </div>

      <div v-else class="text-center py-12 border border-border bg-card">
        <p class="text-sm text-muted-foreground">暂无角色</p>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :pending="deletePending"
      title="确认操作"
      :description="selectedDeleteRole ? `确定要删除角色 &quot;${selectedDeleteRole.name}&quot; 吗？此操作不可恢复。` : '确定要继续吗？'"
      confirm-label="确认"
      @confirm="handleDeleteConfirmed"
    />

    <!-- 角色编辑对话框 -->
    <RoleEditDialog
      v-model:open="editDialogOpen"
      :role="selectedEditRole"
      :role-detail="selectedRoleDetail"
      :permissions="permissions"
      :mode="editMode"
      :detail-loading="roleDetailLoading"
      :pending="rolePending"
      :permission-pending="permissionPending"
      :can-edit-details="canUpdateRole"
      :can-edit-permissions="canEditPermissions"
      @submit="handleRoleSubmit"
      @permissions-submit="handlePermissionsSubmit"
    />
  </AppShell>
</template>
