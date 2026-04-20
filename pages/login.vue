<script setup lang="ts">
import AuthShell from '~/components/layout/AuthShell.vue';
import LoginForm from '~/components/auth/LoginForm.vue';

useHead({
  title: '登录 - URP',
});

const { isAuthenticated } = useAuth();

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/dashboard');
  }
});
</script>

<template>
  <AuthShell title="登录" subtitle="访问您的账户">
    <div v-if="isAuthenticated" class="text-center text-sm text-muted-foreground">
      正在跳转到控制台...
    </div>
    <LoginForm v-else />
  </AuthShell>
</template>
