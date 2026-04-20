<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from '~/components/ui/Dialog.vue';
import DialogHeader from '~/components/ui/DialogHeader.vue';
import DialogTitle from '~/components/ui/DialogTitle.vue';
import DialogDescription from '~/components/ui/DialogDescription.vue';
import Checkbox from '~/components/ui/Checkbox.vue';
import Label from '~/components/ui/Label.vue';
import type { RoleListItem, UserDetail, UserListItem } from '~/lib/types';

interface Props {
  user: UserListItem | null;
  userDetail: UserDetail | null;
  roles: RoleListItem[];
  open: boolean;
  detailLoading?: boolean;
  pending?: boolean;
  readOnly?: boolean;
  currentUserIsSuperAdmin?: boolean;
  editingSelf?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  detailLoading: false,
  pending: false,
  readOnly: false,
  currentUserIsSuperAdmin: false,
  editingSelf: false,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [roleIds: number[]];
}>();

const selectedRoleIds = ref<number[]>([]);

// 监听 userDetail 变化，更新选中的角色
watch(() => props.userDetail, (newDetail) => {
  if (newDetail) {
    selectedRoleIds.value = newDetail.roles.map(role => role.id);
  }
}, { immediate: true });

const initialRoleIds = computed(() => {
  return (props.userDetail?.roles.map(role => role.id) || []).sort((a, b) => a - b);
});

const currentRoleIds = computed(() => {
  return [...selectedRoleIds.value].sort((a, b) => a - b);
});

const selectionChanged = computed(() => {
  if (!props.userDetail) return false;
  if (initialRoleIds.value.length !== currentRoleIds.value.length) return true;
  return initialRoleIds.value.some((id, index) => id !== currentRoleIds.value[index]);
});

const disableClose = computed(() => props.detailLoading || props.pending);

const targetHasSuperAdmin = computed(() => {
  return Boolean(props.userDetail?.roles.some(role => role.name === 'SuperAdmin'));
});

function handleRoleToggle(roleId: number, checked: boolean) {
  if (props.readOnly || props.detailLoading || props.pending) return;

  if (checked) {
    if (!selectedRoleIds.value.includes(roleId)) {
      selectedRoleIds.value = [...selectedRoleIds.value, roleId];
    }
  } else {
    selectedRoleIds.value = selectedRoleIds.value.filter(id => id !== roleId);
  }
}

function handleOpenChange(value: boolean) {
  if (!disableClose.value) {
    emit('update:open', value);
  }
}

function handleSubmit() {
  emit('submit', selectedRoleIds.value);
}
</script>

<template>
  <Dialog :open="props.open" class="sm:max-w-3xl" @update:open="handleOpenChange">
    <DialogHeader>
      <DialogTitle>分配角色</DialogTitle>
      <DialogDescription>为当前用户勾选需要分配的角色。</DialogDescription>
    </DialogHeader>

    <div class="space-y-4">
      <!-- 用户信息 -->
      <div class="border border-border bg-card text-card-foreground">
        <div class="flex flex-col space-y-1.5 p-4 pb-2">
          <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            用户信息
          </h3>
        </div>
        <div class="grid gap-3 p-4 pt-2 md:grid-cols-2">
          <div class="space-y-1">
            <Label>邮箱</Label>
            <div class="text-sm text-foreground">{{ user?.email || '-' }}</div>
          </div>
          <div class="space-y-1">
            <Label>状态</Label>
            <div>
              <span class="inline-flex items-center border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground">
                {{ user?.status === 'active' ? '正常' : '冻结' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 角色分配 -->
      <div class="border border-border bg-card text-card-foreground">
        <div class="flex flex-col space-y-2 p-4 pb-2">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              角色分配
            </h3>
            <span class="inline-flex items-center border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground">
              {{ selectedRoleIds.length }} / {{ roles.length }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ readOnly ? '当前账号只能查看角色分配结果。' : '勾选后将覆盖当前用户已有角色。' }}
          </p>
        </div>
        <div class="space-y-4 p-4 pt-2">
          <!-- 超级管理员提示 -->
          <div v-if="targetHasSuperAdmin" class="border border-border bg-muted/50 p-4">
            <h4 class="mb-2 text-sm font-semibold">超级管理员保底机制</h4>
            <p class="text-sm text-muted-foreground">
              {{ editingSelf && currentUserIsSuperAdmin
                ? '当前登录的超级管理员不能移除自己的超管角色；系统也不能移除最后一个超级管理员。'
                : '系统不能移除最后一个超级管理员；如果后端判定触发保底机制，将拒绝本次提交。' }}
            </p>
          </div>

          <!-- 加载状态 -->
          <div v-if="detailLoading" class="border border-border bg-muted/50 p-4">
            <h4 class="mb-2 text-sm font-semibold">加载中</h4>
            <p class="text-sm text-muted-foreground">正在加载用户角色...</p>
          </div>

          <!-- 加载失败 -->
          <div v-else-if="!userDetail" class="border border-destructive bg-destructive/10 p-4">
            <h4 class="mb-2 text-sm font-semibold text-destructive">加载失败</h4>
            <p class="text-sm text-muted-foreground">未获取到用户详情。</p>
          </div>

          <!-- 暂无角色 -->
          <div v-else-if="roles.length === 0" class="border border-border bg-muted/50 p-4">
            <h4 class="mb-2 text-sm font-semibold">暂无角色</h4>
            <p class="text-sm text-muted-foreground">当前系统还没有可分配的角色。</p>
          </div>

          <!-- 角色列表 -->
          <div v-else class="grid gap-3 md:grid-cols-2">
            <div
              v-for="role in roles"
              :key="role.id"
              class="border border-border bg-background"
            >
              <div class="flex items-start gap-3 p-3">
                <div class="pt-0.5">
                  <Checkbox
                    :id="`role-${role.id}`"
                    :checked="selectedRoleIds.includes(role.id)"
                    :disabled="readOnly || detailLoading || pending"
                    @update:checked="(checked) => handleRoleToggle(role.id, checked)"
                  />
                </div>
                <div class="min-w-0 flex-1 space-y-1">
                  <Label :for="`role-${role.id}`" class="block space-y-1 text-sm cursor-pointer">
                    <span class="block font-medium text-foreground">{{ role.name }}</span>
                    <span class="block text-xs text-muted-foreground">
                      {{ role.description || '暂无描述' }}
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-border bg-background px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              :disabled="disableClose"
              @click="handleOpenChange(false)"
            >
              取消
            </button>
            <button
              v-if="!readOnly"
              type="button"
              class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              :disabled="detailLoading || pending || !userDetail || !selectionChanged"
              @click="handleSubmit"
            >
              {{ pending ? '保存中...' : '保存角色' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
