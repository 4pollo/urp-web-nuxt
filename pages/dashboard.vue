<script setup lang="ts">
import { computed } from 'vue';
import { CircleUser, KeyRound, Shield, Users } from 'lucide-vue-next';
import AppShell from '~/components/layout/AppShell.vue';
import { useMenuStore } from '~/stores/menu';

definePageMeta({
  middleware: 'auth'
});

useHead({
  title: '控制台 - URP',
});

const menuStore = useMenuStore();

// 获取管理菜单项
const adminItems = computed(() => menuStore.navItems.filter(item =>
  item.href.startsWith('/admin/')
));

// 快捷链接
const quickLinks = computed(() => {
  const items: Array<{
    title: string;
    description: string;
    href: string;
    icon: any;
  }> = adminItems.value.map(item => {
    if (item.href === '/admin/users') {
      return {
        title: '用户管理',
        description: '管理系统用户、状态与角色分配。',
        href: item.href,
        icon: Users,
      };
    }

    if (item.href === '/admin/roles') {
      return {
        title: '角色管理',
        description: '维护角色定义与权限配置。',
        href: item.href,
        icon: Shield,
      };
    }

    return {
      title: '权限管理',
      description: '维护权限标识、分组与描述。',
      href: item.href,
      icon: KeyRound,
    };
  });

  items.push({
    title: '用户中心',
    description: '查看账户信息并维护登录密码。',
    href: '/user',
    icon: CircleUser,
  });

  return items;
});
</script>

<template>
  <AppShell>
    <div class="space-y-6">
      <div class="space-y-2">
        <h1 class="page-title">控制台</h1>
        <p class="text-xs uppercase tracking-[0.05em] text-muted-foreground">
          系统概览与快捷入口
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="item in quickLinks"
          :key="item.href"
          :to="item.href"
          class="border border-border bg-card text-card-foreground transition-colors hover:bg-accent"
        >
          <div class="flex flex-col space-y-1.5 p-6">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-base font-semibold leading-none tracking-tight">
                {{ item.title }}
              </h3>
              <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background">
                <component :is="item.icon" :size="16" />
              </div>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="border border-border bg-card text-card-foreground">
          <div class="border-b border-border p-4 pb-2">
            <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              使用提示
            </h3>
          </div>
          <div class="space-y-3 p-4 pt-2 text-sm text-foreground">
            <p>使用左侧导航可以快速进入常用模块。</p>
            <p>页面级搜索仅会在支持搜索的页面顶部显示。</p>
          </div>
        </div>

        <div class="border border-border bg-card text-card-foreground">
          <div class="border-b border-border p-4 pb-2">
            <h3 class="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              安全提示
            </h3>
          </div>
          <div class="space-y-3 p-4 pt-2 text-sm text-foreground">
            <p>角色与权限调整后，请及时核对对应模块的访问结果。</p>
            <p>如需维护账号信息或修改密码，请前往用户中心。</p>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
