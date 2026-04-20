<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff, LockKeyhole } from 'lucide-vue-next';
import Modal from '~/components/ui/Modal.vue';
import ModalHeader from '~/components/ui/ModalHeader.vue';
import ModalTitle from '~/components/ui/ModalTitle.vue';
import ModalDescription from '~/components/ui/ModalDescription.vue';
import Label from '~/components/ui/Label.vue';
import InputGroup from '~/components/ui/InputGroup.vue';
import InputGroupInput from '~/components/ui/InputGroupInput.vue';
import InputGroupAddon from '~/components/ui/InputGroupAddon.vue';
import { apiRequest } from '~/lib/fetcher';

const toast = useToast();

const open = ref(false);
const isSubmitting = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

function resetForm() {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
}

async function handleSubmit() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    toast.error('请完整填写密码信息');
    return;
  }

  if (newPassword.value.length < 6) {
    toast.error('新密码长度至少为 6 位');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.error('两次输入的新密码不一致');
    return;
  }

  isSubmitting.value = true;

  try {
    await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      }),
    });
    toast.success('密码修改成功');
    resetForm();
    open.value = false;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '修改密码失败');
  } finally {
    isSubmitting.value = false;
  }
}

function handleOpenChange(value: boolean) {
  if (!isSubmitting.value) {
    open.value = value;
    if (!value) {
      resetForm();
    }
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      @click="open = true"
    >
      <LockKeyhole :size="16" class="mr-2" />
      修改密码
    </button>

    <Modal :open="open" @update:open="handleOpenChange">
      <ModalHeader>
        <ModalTitle>修改密码</ModalTitle>
        <ModalDescription>
          请输入当前密码并设置新的登录密码。
        </ModalDescription>
      </ModalHeader>

      <form @submit.prevent="handleSubmit">
        <div class="border border-border bg-card text-card-foreground">
          <div class="space-y-5 p-4">
            <div class="space-y-2">
              <Label for="current-password">当前密码</Label>
              <InputGroup>
                <InputGroupInput
                  id="current-password"
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="请输入当前密码"
                  required
                  autocomplete="current-password"
                />
                <InputGroupAddon>
                  <button
                    class="inline-flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    type="button"
                    tabindex="-1"
                    :aria-label="showCurrentPassword ? '隐藏当前密码' : '显示当前密码'"
                    @mousedown.prevent
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <EyeOff v-if="showCurrentPassword" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div class="space-y-2">
              <Label for="new-password">新密码</Label>
              <InputGroup>
                <InputGroupInput
                  id="new-password"
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="请输入新密码"
                  required
                  minlength="6"
                  autocomplete="new-password"
                />
                <InputGroupAddon>
                  <button
                    class="inline-flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    type="button"
                    tabindex="-1"
                    :aria-label="showNewPassword ? '隐藏新密码' : '显示新密码'"
                    @mousedown.prevent
                    @click="showNewPassword = !showNewPassword"
                  >
                    <EyeOff v-if="showNewPassword" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </InputGroupAddon>
              </InputGroup>
              <p class="text-xs text-muted-foreground">新密码长度至少为 6 位</p>
            </div>

            <div class="space-y-2">
              <Label for="confirm-password">确认新密码</Label>
              <InputGroup>
                <InputGroupInput
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="请再次输入新密码"
                  required
                  autocomplete="new-password"
                />
                <InputGroupAddon>
                  <button
                    class="inline-flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    type="button"
                    tabindex="-1"
                    :aria-label="showConfirmPassword ? '隐藏确认密码' : '显示确认密码'"
                    @mousedown.prevent
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <EyeOff v-if="showConfirmPassword" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-border bg-background px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            :disabled="isSubmitting"
            @click="open = false"
          >
            取消
          </button>
          <button
            type="submit"
            class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>
