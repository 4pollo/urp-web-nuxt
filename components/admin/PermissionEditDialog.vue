<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from '~/components/ui/Dialog.vue';
import DialogHeader from '~/components/ui/DialogHeader.vue';
import DialogTitle from '~/components/ui/DialogTitle.vue';
import DialogDescription from '~/components/ui/DialogDescription.vue';
import Checkbox from '~/components/ui/Checkbox.vue';
import Label from '~/components/ui/Label.vue';
import { SYSTEM_PERMISSION_KEYS } from '~/lib/permission-keys';
import type { PermissionItem } from '~/lib/types';

interface Props {
  permission: PermissionItem | null;
  open: boolean;
  mode?: 'create' | 'edit';
  pending?: boolean;
  readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'edit',
  pending: false,
  readOnly: false,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: {
    key: string;
    group: string;
    description: string;
    showInMenu: boolean;
    menuLabel: string;
    menuIcon: string;
    menuPath: string;
    menuOrder: number;
  }];
}>();

const key = ref('');
const group = ref('');
const description = ref('');
const showInMenu = ref(false);
const menuLabel = ref('');
const menuIcon = ref('');
const menuPath = ref('');
const menuOrder = ref(0);

const isCreateMode = computed(() => props.mode === 'create');

function isSystemPermission(permKey: string): boolean {
  return SYSTEM_PERMISSION_KEYS.includes(permKey as any);
}

// 监听 permission 变化
watch(() => props.permission, (newPermission) => {
  key.value = newPermission?.key || '';
  group.value = newPermission?.group || '';
  description.value = newPermission?.description || '';
  showInMenu.value = (newPermission as any)?.showInMenu || false;
  menuLabel.value = (newPermission as any)?.menuLabel || '';
  menuIcon.value = (newPermission as any)?.menuIcon || '';
  menuPath.value = (newPermission as any)?.menuPath || '';
  menuOrder.value = (newPermission as any)?.menuOrder || 0;
}, { immediate: true });

function handleSubmit(event: Event) {
  event.preventDefault();
  if (props.readOnly || props.pending) return;

  // 系统权限只提交菜单配置字段
  if (props.permission && isSystemPermission(props.permission.key)) {
    emit('submit', {
      showInMenu: showInMenu.value,
      menuLabel: menuLabel.value.trim(),
      menuIcon: menuIcon.value.trim(),
      menuPath: menuPath.value.trim(),
      menuOrder: menuOrder.value,
    } as any);
  } else {
    // 非系统权限提交所有字段
    emit('submit', {
      key: key.value.trim(),
      group: group.value.trim(),
      description: description.value.trim(),
      showInMenu: showInMenu.value,
      menuLabel: menuLabel.value.trim(),
      menuIcon: menuIcon.value.trim(),
      menuPath: menuPath.value.trim(),
      menuOrder: menuOrder.value,
    });
  }
}

function handleOpenChange(value: boolean) {
  if (!props.pending) {
    emit('update:open', value);
  }
}
</script>

<template>
  <Dialog :open="props.open" class="sm:max-w-2xl" @update:open="handleOpenChange">
    <DialogHeader>
      <DialogTitle>{{ isCreateMode ? '新增权限' : '编辑权限' }}</DialogTitle>
      <DialogDescription>
        {{ isCreateMode ? '填写新的权限标识、分组与描述。' : '修改权限标识、分组与描述，并配置菜单显示。' }}
      </DialogDescription>
    </DialogHeader>

    <form @submit="handleSubmit">
      <!-- 权限信息 -->
      <div class="border border-border bg-card text-card-foreground">
        <div class="flex flex-col space-y-1.5 p-4 pb-2">
          <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {{ isCreateMode ? '新权限信息' : '权限信息' }}
          </h3>
        </div>
        <div class="space-y-5 p-4 pt-2">
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="permission-key">权限标识</Label>
              <input
                id="permission-key"
                v-model="key"
                required
                :disabled="readOnly || pending"
                class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <Label for="permission-group">权限分组</Label>
              <input
                id="permission-group"
                v-model="group"
                required
                :disabled="readOnly || pending"
                class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="permission-description">权限描述</Label>
            <textarea
              id="permission-description"
              v-model="description"
              :disabled="readOnly || pending"
              rows="4"
              class="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>
      </div>

      <!-- 菜单配置 -->
      <div class="mt-6 border border-border bg-card text-card-foreground">
        <div class="flex flex-col space-y-1.5 p-4 pb-2">
          <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            菜单配置
          </h3>
        </div>
        <div class="space-y-5 p-4 pt-2">
          <div class="flex items-center gap-3">
            <Checkbox
              id="show-in-menu"
              v-model:checked="showInMenu"
              :disabled="readOnly || pending"
            />
            <Label for="show-in-menu" class="cursor-pointer text-sm font-medium">
              在侧边栏菜单中显示
            </Label>
          </div>

          <div v-if="showInMenu" class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="menu-label">菜单文本</Label>
              <input
                id="menu-label"
                v-model="menuLabel"
                placeholder="例如：用户管理"
                :disabled="readOnly || pending"
                class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <Label for="menu-icon">图标标识</Label>
              <input
                id="menu-icon"
                v-model="menuIcon"
                placeholder="例如：users, shield, key-round"
                :disabled="readOnly || pending"
                class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div v-if="showInMenu" class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="menu-path">菜单路径</Label>
              <input
                id="menu-path"
                v-model="menuPath"
                placeholder="例如：/admin/users"
                :disabled="readOnly || pending"
                class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <Label for="menu-order">排序</Label>
              <input
                id="menu-order"
                v-model.number="menuOrder"
                type="number"
                :disabled="readOnly || pending"
                class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-border bg-background px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          :disabled="pending"
          @click="handleOpenChange(false)"
        >
          取消
        </button>
        <button
          v-if="!readOnly"
          type="submit"
          class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          :disabled="pending || !key.trim() || !group.trim()"
        >
          {{ pending ? (isCreateMode ? '创建中...' : '保存中...') : (isCreateMode ? '创建权限' : '保存') }}
        </button>
      </div>
    </form>
  </Dialog>
</template>
