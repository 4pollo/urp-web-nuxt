<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppShell from '~/components/layout/AppShell.vue';
import UserSummaryCard from '~/components/user/UserSummaryCard.vue';
import RoleListCard from '~/components/user/RoleListCard.vue';
import PermissionListCard from '~/components/user/PermissionListCard.vue';
import ChangePasswordDialog from '~/components/user/ChangePasswordDialog.vue';
import { apiRequest } from '~/lib/fetcher';
import { navItems } from '~/lib/capabilities';
import type { UserDetail } from '~/lib/types';

definePageMeta({
  middleware: 'auth'
});

useHead({
  title: '用户中心 - URP',
});

const toast = useToast();

const user = ref<UserDetail | null>(null);
const permissions = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// 加载用户信息
async function loadUser() {
  loading.value = true;
  error.value = null;

  try {
    const result = await apiRequest<UserDetail>('/api/auth/me');
    user.value = result.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载用户信息失败';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

// 加载权限列表
async function loadPermissions() {
  try {
    const result = await apiRequest<{ permissions: string[] }>('/api/permissions/me');
    permissions.value = result.data.permissions;
  } catch (err) {
    console.error('加载权限失败:', err);
  }
}

// 重试加载
function retry() {
  loadUser();
  loadPermissions();
}

onMounted(() => {
  loadUser();
  loadPermissions();
});
</script>

<template>
  <AppShell :nav-items="navItems">
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="page-title">用户中心</h1>
        <p class="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
          查看您的账户信息、权限并维护登录密码
        </p>
      </div>
      <div class="flex items-center gap-3">
        <ChangePasswordDialog />
      </div>
    </div>

    <div v-if="error" class="border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
      <div class="font-semibold">加载用户中心失败</div>
      <div class="mt-1">{{ error }}</div>
      <button
        type="button"
        class="mt-3 inline-flex h-8 items-center justify-center border border-destructive bg-destructive px-3 text-xs font-semibold uppercase tracking-[0.05em] text-destructive-foreground transition-colors hover:bg-destructive/90"
        @click="retry"
      >
        重试
      </button>
    </div>

    <div v-else-if="loading" class="py-12 text-center">
      <p class="text-sm text-muted-foreground">正在加载用户信息...</p>
    </div>

    <div v-else-if="!user" class="py-12 text-center">
      <p class="text-sm text-muted-foreground">无法读取当前会话</p>
      <p class="mt-2 text-xs text-muted-foreground">当前登录状态已失效，请重新登录后再试。</p>
      <button
        type="button"
        class="mt-4 inline-flex h-10 items-center justify-center border border-primary bg-primary px-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
        @click="$router.push('/login')"
      >
        返回登录
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-2">
        <UserSummaryCard
          :email="user.email"
          :status="user.status"
          :last-login-at="user.lastLoginAt"
        />
        <RoleListCard :roles="user.roles || []" />
      </div>
      <PermissionListCard :permissions="permissions" />
    </div>
  </AppShell>
</template>
