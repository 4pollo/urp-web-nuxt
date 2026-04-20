<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, ChevronUp, Minus } from 'lucide-vue-next';
import { cn } from '~/lib/utils';
import type { PermissionItem, RoleDetail, RoleListItem } from '~/lib/types';

interface Props {
  role: RoleListItem | null;
  roleDetail: RoleDetail | null;
  permissions: PermissionItem[];
  open: boolean;
  mode?: 'create' | 'edit';
  detailLoading?: boolean;
  pending?: boolean;
  permissionPending?: boolean;
  canEditDetails?: boolean;
  canEditPermissions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'edit',
  detailLoading: false,
  pending: false,
  permissionPending: false,
  canEditDetails: true,
  canEditPermissions: true,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: { name: string; description: string }];
  permissionsSubmit: [permissionIds: number[]];
}>();

const name = ref('');
const description = ref('');
const selectedPermissionIds = ref<number[]>([]);
const expandedPermissionGroups = ref<string[]>([]);
const activeTab = ref<'details' | 'permissions'>('details');

// 监听 role 变化
watch(() => props.role, (newRole) => {
  name.value = newRole?.name || '';
  description.value = newRole?.description || '';
}, { immediate: true });

// 监听 roleDetail 和 permissions 变化
watch([() => props.roleDetail, () => props.permissions], ([newDetail, newPermissions]) => {
  if (newDetail) {
    selectedPermissionIds.value = newDetail.permissions.map(p => p.id);
  }
  if (newPermissions.length > 0) {
    expandedPermissionGroups.value = Array.from(new Set(newPermissions.map(p => p.group)));
  }
}, { immediate: true });

// 监听 open 变化，重置 tab
watch([() => props.open, () => props.mode, () => props.role?.id], () => {
  activeTab.value = 'details';
});

const permissionsByGroup = computed(() => {
  const groups = new Map<string, PermissionItem[]>();

  for (const permission of props.permissions) {
    const list = groups.get(permission.group) || [];
    list.push(permission);
    groups.set(permission.group, list);
  }

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, 'zh-CN'));
});

const roleLocked = computed(() => {
  return props.mode === 'edit' && (props.role?.name === 'SuperAdmin' || props.role?.name === 'Guest');
});

const isCreateMode = computed(() => props.mode === 'create');
const detailsReadOnly = computed(() => !props.canEditDetails);
const permissionsReadOnly = computed(() => !props.canEditPermissions);

const permissionSelectionChanged = computed(() => {
  if (!props.roleDetail) return false;

  const initialIds = props.roleDetail.permissions.map(p => p.id).sort((a, b) => a - b);
  const currentIds = [...selectedPermissionIds.value].sort((a, b) => a - b);

  if (initialIds.length !== currentIds.length) return true;
  return initialIds.some((id, index) => id !== currentIds[index]);
});

const disableClose = computed(() => props.pending || props.permissionPending || props.detailLoading);

function handleSubmit(event: Event) {
  event.preventDefault();
  if (detailsReadOnly.value || props.pending) return;
  emit('submit', { name: name.value.trim(), description: description.value.trim() });
}

function handlePermissionToggle(permissionId: number, checked: boolean) {
  if (permissionsReadOnly.value || props.permissionPending || props.detailLoading || roleLocked.value) return;

  if (checked) {
    if (!selectedPermissionIds.value.includes(permissionId)) {
      selectedPermissionIds.value = [...selectedPermissionIds.value, permissionId];
    }
  } else {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => id !== permissionId);
  }
}

function handleGroupSelectionToggle(permissionIds: number[]) {
  if (permissionsReadOnly.value || props.permissionPending || props.detailLoading || roleLocked.value) return;

  const allSelected = permissionIds.every(id => selectedPermissionIds.value.includes(id));

  if (allSelected) {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !permissionIds.includes(id));
  } else {
    const currentSet = new Set(selectedPermissionIds.value);
    permissionIds.forEach(id => currentSet.add(id));
    selectedPermissionIds.value = Array.from(currentSet);
  }
}

function togglePermissionGroupExpanded(group: string) {
  if (expandedPermissionGroups.value.includes(group)) {
    expandedPermissionGroups.value = expandedPermissionGroups.value.filter(g => g !== group);
  } else {
    expandedPermissionGroups.value = [...expandedPermissionGroups.value, group];
  }
}

function handleOpenChange(value: boolean) {
  if (!disableClose.value) {
    emit('update:open', value);
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-5xl">
      <DialogHeader>
        <DialogTitle>{{ isCreateMode ? '新增角色' : '编辑角色' }}</DialogTitle>
        <DialogDescription>
          {{ isCreateMode ? '填写角色名称与描述。创建完成后可继续分配权限。' : '修改角色名称、描述与分配权限。' }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Tabs -->
        <div class="inline-flex gap-1 border-b border-border p-0">
          <button
            type="button"
            :class="cn(
              'inline-flex items-center justify-center border-b-2 border-transparent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              activeTab === 'details' && 'border-foreground text-foreground'
            )"
            @click="activeTab = 'details'"
          >
            基础信息
          </button>
          <button
            v-if="!isCreateMode && canEditPermissions"
            type="button"
            :class="cn(
              'inline-flex items-center justify-center border-b-2 border-transparent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              activeTab === 'permissions' && 'border-foreground text-foreground'
            )"
            @click="activeTab = 'permissions'"
          >
            角色权限
          </button>
        </div>

        <!-- Details Tab -->
        <div v-if="activeTab === 'details'" class="border border-border bg-card text-card-foreground">
          <div class="flex flex-col space-y-1.5 p-4 pb-2">
            <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {{ isCreateMode ? '新角色信息' : '角色信息' }}
            </h3>
          </div>
          <div class="p-4 pt-2">
            <form class="space-y-5" @submit="handleSubmit">
              <div v-if="roleLocked" class="border border-border bg-muted/50 p-4">
                <h4 class="mb-2 text-sm font-semibold">系统角色</h4>
                <p class="text-sm text-muted-foreground">系统角色的名称和描述不能修改。</p>
              </div>

              <div class="space-y-2">
                <Label for="role-name">角色名称</Label>
                <input
                  id="role-name"
                  v-model="name"
                  required
                  :disabled="detailsReadOnly || pending || roleLocked"
                  class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div class="space-y-2">
                <Label for="role-description">角色描述</Label>
                <textarea
                  id="role-description"
                  v-model="description"
                  :disabled="detailsReadOnly || pending || roleLocked"
                  rows="5"
                  class="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>

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
                  v-if="!detailsReadOnly"
                  type="submit"
                  class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  :disabled="pending || roleLocked || !name.trim()"
                >
                  {{ pending ? (isCreateMode ? '创建中...' : '保存中...') : (isCreateMode ? '创建角色' : '保存角色') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Permissions Tab -->
        <div v-if="!isCreateMode && activeTab === 'permissions'" class="border border-border bg-card text-card-foreground">
          <div class="flex flex-col space-y-2 p-4 pb-2">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                角色权限
              </h3>
              <span v-if="roleDetail" class="inline-flex items-center border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground">
                {{ selectedPermissionIds.length }} / {{ permissions.length }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ permissionsReadOnly ? '当前账号只能查看角色已有权限。' : '为当前角色勾选需要的权限。' }}
            </p>
          </div>
          <div class="space-y-4 p-4 pt-2">
            <!-- Loading -->
            <div v-if="detailLoading" class="border border-border bg-muted/50 p-4">
              <h4 class="mb-2 text-sm font-semibold">加载中</h4>
              <p class="text-sm text-muted-foreground">正在加载角色权限...</p>
            </div>

            <!-- Loaded -->
            <template v-else-if="roleDetail">
              <div v-if="roleLocked" class="border border-border bg-muted/50 p-4">
                <h4 class="mb-2 text-sm font-semibold">系统角色</h4>
                <p class="text-sm text-muted-foreground">系统角色的权限不能修改。</p>
              </div>

              <div v-if="permissionsByGroup.length === 0" class="border border-border bg-muted/50 p-4">
                <h4 class="mb-2 text-sm font-semibold">暂无权限</h4>
                <p class="text-sm text-muted-foreground">权限列表为空，请检查权限数据是否已加载。</p>
              </div>

              <div v-else class="h-[420px] overflow-auto pr-3">
                <div class="space-y-4">
                  <div
                    v-for="[group, items] in permissionsByGroup"
                    :key="group"
                    class="border border-border bg-card text-card-foreground"
                  >
                    <div class="flex items-center gap-3 border-b border-border px-6 py-4">
                      <button
                        type="button"
                        class="flex h-5 w-5 shrink-0 items-center justify-center border border-input bg-background text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="permissionsReadOnly || permissionPending || detailLoading || roleLocked"
                        @click.stop="handleGroupSelectionToggle(items.map(p => p.id))"
                      >
                        <div
                          v-if="items.every(p => selectedPermissionIds.includes(p.id))"
                          class="h-2.5 w-2.5 bg-foreground"
                        />
                        <Minus
                          v-else-if="items.some(p => selectedPermissionIds.includes(p.id))"
                          :size="14"
                        />
                      </button>
                      <button
                        type="button"
                        class="flex flex-1 items-center justify-between gap-3 text-left"
                        @click="togglePermissionGroupExpanded(group)"
                      >
                        <h3 class="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                          {{ group }}
                        </h3>
                        <div class="flex items-center gap-3">
                          <span class="inline-flex items-center border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground">
                            {{ items.filter(p => selectedPermissionIds.includes(p.id)).length }} / {{ items.length }}
                          </span>
                          <ChevronUp v-if="expandedPermissionGroups.includes(group)" :size="16" class="text-muted-foreground" />
                          <ChevronDown v-else :size="16" class="text-muted-foreground" />
                        </div>
                      </button>
                    </div>
                    <div
                      :class="cn(
                        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                        expandedPermissionGroups.includes(group) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      )"
                    >
                      <div class="overflow-hidden">
                        <div class="p-4 pt-2">
                          <div class="grid gap-3 md:grid-cols-3">
                            <div
                              v-for="permission in items"
                              :key="permission.id"
                              class="border border-border bg-background"
                            >
                              <div class="flex items-start gap-3 p-3">
                                <div class="pt-0.5">
                                  <Checkbox
                                    :id="`permission-${permission.id}`"
                                    :model-value="selectedPermissionIds.includes(permission.id)"
                                    :disabled="permissionsReadOnly || permissionPending || detailLoading || roleLocked"
                                    @update:model-value="(checked: boolean) => handlePermissionToggle(permission.id, checked)"
                                  />
                                </div>
                                <div class="min-w-0 flex-1 space-y-1">
                                  <Label :for="`permission-${permission.id}`" class="block space-y-1 text-sm cursor-pointer">
                                    <span class="block font-medium text-foreground">
                                      {{ permission.description || permission.key }}
                                    </span>
                                    <span class="block text-xs text-muted-foreground">
                                      {{ permission.key }}
                                    </span>
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                  v-if="!permissionsReadOnly"
                  type="button"
                  class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  :disabled="detailLoading || permissionPending || roleLocked || !permissionSelectionChanged"
                  @click="emit('permissionsSubmit', selectedPermissionIds)"
                >
                  {{ permissionPending ? '保存中...' : '保存权限' }}
                </button>
              </div>
            </template>

            <!-- Error -->
            <div v-else class="border border-destructive bg-destructive/10 p-4">
              <h4 class="mb-2 text-sm font-semibold text-destructive">加载失败</h4>
              <p class="text-sm text-muted-foreground">未获取到角色详情。</p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
