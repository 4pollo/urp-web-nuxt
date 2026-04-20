<script setup lang="ts">
import AuthShell from '~/components/layout/AuthShell.vue';
import RegisterForm from '~/components/auth/RegisterForm.vue';

useHead({
  title: '注册 - URP',
});

const { isAuthenticated } = useAuth();

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/dashboard');
  }
});
</script>

<template>
  <AuthShell title="注册" subtitle="创建新账户">
    <div v-if="isAuthenticated" class="text-center text-sm text-muted-foreground">
      正在跳转到控制台...
    </div>
    <RegisterForm v-else />
  </AuthShell>
</template>
