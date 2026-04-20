<script setup lang="ts">
const features = [
  '基于角色的访问控制 (RBAC)',
  'JWT 双令牌认证机制',
  '细粒度权限管理',
  '多角色支持与权限继承',
];

const brandDescription =
  '企业级 RBAC 权限管理解决方案，提供完整的用户、角色和权限控制能力。基于 NestJS 构建，支持 JWT 认证和多角色授权。';

interface Props {
  title: string;
  subtitle: string;
}

defineProps<Props>();
</script>

<template>
  <main class="grid min-h-screen bg-muted/40 lg:grid-cols-[1.15fr_0.85fr]">
    <section class="auth-dark-panel hidden border-r border-border px-10 py-12 lg:flex lg:items-center lg:px-16 lg:py-16">
      <div class="relative z-10 max-w-xl space-y-8">
        <div class="space-y-4">
          <span class="inline-flex items-center border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-white/70">
            权限管理系统
          </span>
          <div class="font-syne text-[72px] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-white">
            URP
          </div>
          <p class="max-w-md text-sm leading-7 text-white/70">
            {{ brandDescription }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="feature in features"
            :key="feature"
            class="border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/85"
          >
            {{ feature }}
          </div>
        </div>
      </div>
    </section>
    <section class="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-16 lg:py-16">
      <div class="w-full max-w-[440px] border border-border bg-card text-card-foreground">
        <div class="space-y-3 p-10 pb-0">
          <h1 class="page-title text-[40px] text-foreground">{{ title }}</h1>
          <p class="text-xs uppercase tracking-[0.05em] text-muted-foreground">
            {{ subtitle }}
          </p>
        </div>
        <div class="p-10 pt-8">
          <slot />
        </div>
      </div>
    </section>
  </main>
</template>
