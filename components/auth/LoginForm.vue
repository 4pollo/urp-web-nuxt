<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import Label from '~/components/ui/Label.vue';
import InputGroup from '~/components/ui/InputGroup.vue';
import InputGroupInput from '~/components/ui/InputGroupInput.vue';
import InputGroupAddon from '~/components/ui/InputGroupAddon.vue';

const { login, setError, isSubmitting } = useAuth();
const toast = useToast();
const showPassword = ref(false);

const email = ref('');
const password = ref('');

async function handleSubmit() {
  setError(null);

  try {
    await login(email.value, password.value);
    toast.success('登录成功，正在跳转...');
    await navigateTo('/dashboard');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '登录失败');
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="space-y-2">
        <Label for="login-email">邮箱地址</Label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
          autocomplete="email"
          class="flex h-11 w-full border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div class="space-y-2">
        <Label for="login-password">密码</Label>
        <InputGroup>
          <InputGroupInput
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="输入密码"
            required
            autocomplete="current-password"
          />
          <InputGroupAddon>
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              type="button"
              tabindex="-1"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              @mousedown.prevent
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="14" />
              <Eye v-else :size="14" />
            </button>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
    <button
      class="inline-flex h-10 w-full items-center justify-center whitespace-nowrap border border-primary bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      type="submit"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? '登录中...' : '登录' }}
    </button>
    <div class="pt-2 text-center text-xs text-muted-foreground">
      还没有账号？
      <NuxtLink
        class="border-b border-border text-foreground"
        to="/register"
      >
        立即注册
      </NuxtLink>
    </div>
  </form>
</template>
