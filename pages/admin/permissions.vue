<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, KeyRound, X, Plus } from 'lucide-vue-next';
import AppShell from '~/components/layout/AppShell.vue';
import PermissionsTable from '~/components/admin/PermissionsTable.vue';
import PermissionEditDialog from '~/components/admin/PermissionEditDialog.vue';
import ConfirmDialog from '~/components/common/ConfirmDialog.vue';
import AdminStats from '~/components/admin/AdminStats.vue';
import { apiRequest } from '~/lib/fetcher';
import { navItems } from '~/lib/capabilities';
import type { PermissionItem } from '~/lib/types';

definePageMeta({
  middleware: 'auth'
});

useHead({
  title: '权限管理 - URP',
});

const toast = useToast();

// 搜索状态
const draftSearch = ref('');
const currentSearch = ref('');
const currentPage = ref(1);
const currentLimit = ref(10);

// 数据状态
const permissions = ref<{ items: PermissionItem[]; total: number; page: number; limit: number } | null>(null);
const loading = ref(false);

// 对话框状态
const selectedDeletePermission = ref<PermissionItem | null>(null);
const selectedEditPermission = ref<PermissionItem | null>(null);
const editMode = ref<'create' | 'edit'>('edit');
const deletePending = ref(false);
const permissionPending = ref(false);
const pendingPermissionId = ref<number | null>(null);

// 权限
const canCreatePermission = ref(true);
const canUpdatePermission = ref(true);
const canDeletePermission = ref(true);

// 计算属性
const totals = computed(() => ({
  totalUsers: 0,
  totalRoles: 0,
  totalPermissions: permissions.value?.total || 0,
}));

// 加载权限列表
async function loadPermissions(page: number, limit: number, search: string) {
  loading.value = true;
  try {
    const result = await apiRequest<{ items: PermissionItem[]; total: number; page: number; limit: number }>(
      `/api/permissions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    permissions.value = result.data;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载权限列表失败');
  } finally {
    loading.value = false;
  }
}

// 提交搜索
function submitSearch() {
  currentSearch.value = draftSearch.value;
  currentPage.value = 1;
  loadPermissions(1, currentLimit.value, draftSearch.value);
}

// 清空搜索
function clearSearch() {
  draftSearch.value = '';
  currentSearch.value = '';
  currentPage.value = 1;
  loadPermissions(1, currentLimit.value, '');
}

// 打开创建对话框
function handlePermissionCreate() {
  if (!canCreatePermission.value || pendingPermissionId.value !== null || deletePending.value) {
    return;
  }

  selectedEditPermission.value = {} as PermissionItem;
  editMode.value = 'create';
}

// 打开编辑对话框
function handlePermissionEdit(permission: PermissionItem) {
  if (!canUpdatePermission.value || pendingPermissionId.value !== null || deletePending.value) {
    return;
  }

  selectedEditPermission.value = permission;
  editMode.value = 'edit';
}

// 提交权限信息
async function handlePermissionSubmit(payload: any) {
  if (!selectedEditPermission.value || permissionPending.value) return;

  permissionPending.value = true;
  if (editMode.value === 'edit') {
    pendingPermissionId.value = selectedEditPermission.value.id;
  }

  try {
    if (editMode.value === 'create') {
      await apiRequest('/api/permissions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('权限创建成功');
      selectedEditPermission.value = null;
    } else {
      await apiRequest(`/api/permissions/${selectedEditPermission.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      toast.success('权限信息更新成功');
      selectedEditPermission.value = null;
    }
    await loadPermissions(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : editMode.value === 'create' ? '创建失败' : '更新失败');
  } finally {
    permissionPending.value = false;
    pendingPermissionId.value = null;
  }
}

// 确认删除
async function handleDeleteConfirmed() {
  // 保存引用，防止对话框关闭后被清空
  const permissionToDelete = selectedDeletePermission.value;

  if (!canDeletePermission.value || !permissionToDelete || deletePending.value) {
    return;
  }

  deletePending.value = true;
  pendingPermissionId.value = permissionToDelete.id;

  try {
    await apiRequest(`/api/permissions/${permissionToDelete.id}`, {
      method: 'DELETE',
    });
    toast.success('权限删除成功');
    selectedDeletePermission.value = null;
    await loadPermissions(currentPage.value, currentLimit.value, currentSearch.value);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败');
  } finally {
    deletePending.value = false;
    pendingPermissionId.value = null;
  }
}

// 页面切换
function handlePageChange(page: number) {
  currentPage.value = page;
  loadPermissions(page, currentLimit.value, currentSearch.value);
}

// 对话框打开状态
const deleteDialogOpen = computed({
  get: () => !!selectedDeletePermission.value,
  set: (value) => { if (!value) selectedDeletePermission.value = null; }
});

const editDialogOpen = computed({
  get: () => !!selectedEditPermission.value,
  set: (value) => { if (!value) selectedEditPermission.value = null; }
});

// 初始化
onMounted(() => {
  loadPermissions(currentPage.value, currentLimit.value, currentSearch.value);
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
              placeholder="搜索权限..."
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
          <h1 class="page-title">权限管理</h1>
          <p class="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
            管理系统权限标识与分组
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="canCreatePermission"
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap border border-primary bg-primary px-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            @click="handlePermissionCreate"
          >
            <Plus :size="16" />
            新建权限
          </button>
        </div>
      </div>

      <AdminStats
        :total-users="totals.totalUsers"
        :total-roles="totals.totalRoles"
        :total-permissions="totals.totalPermissions"
      />

      <div v-if="loading && !permissions" class="text-center py-12">
        <p class="text-sm text-muted-foreground">正在加载权限数据...</p>
      </div>

      <div v-else-if="permissions && permissions.items.length > 0">
        <PermissionsTable
          :permissions="permissions.items"
          :page="permissions.page"
          :total="permissions.total"
          :limit="permissions.limit"
          :pending-permission-id="pendingPermissionId"
          :can-edit="canUpdatePermission"
          :can-delete="canDeletePermission"
          @page-change="handlePageChange"
          @edit="handlePermissionEdit"
          @delete="(permission) => {
            if (!canDeletePermission || pendingPermissionId !== null || selectedEditPermission) return;
            selectedDeletePermission = permission;
          }"
        />
      </div>

      <div v-else class="text-center py-12 border border-border bg-card">
        <p class="text-sm text-muted-foreground">暂无权限</p>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :pending="deletePending"
      title="确认操作"
      :description="selectedDeletePermission ? `确定要删除权限 &quot;${selectedDeletePermission.key}&quot; 吗？此操作不可恢复。` : '确定要继续吗？'"
      confirm-label="确认"
      @confirm="handleDeleteConfirmed"
    />

    <!-- 权限编辑对话框 -->
    <PermissionEditDialog
      v-model:open="editDialogOpen"
      :permission="selectedEditPermission"
      :mode="editMode"
      :pending="permissionPending"
      :read-only="!canUpdatePermission"
      @submit="handlePermissionSubmit"
    />
  </AppShell>
</template>
