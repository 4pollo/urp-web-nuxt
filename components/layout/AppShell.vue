<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useColorMode } from '@vueuse/core';
import {
  CircleUser,
  Gauge,
  KeyRound,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sun,
  Users,
} from 'lucide-vue-next';
import type { NavItem } from '~/lib/types';
import { logout } from '~/lib/auth';
import { cn } from '~/lib/utils';

interface Props {
  navItems?: NavItem[];
  headerCenter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  navItems: () => [],
  headerCenter: false,
});

const route = useRoute();
const router = useRouter();
const colorMode = useColorMode();
const toast = useToast();

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'app-shell:sidebar-collapsed';

const mounted = ref(false);
const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
const logoutDialogOpen = ref(false);
const logoutPending = ref(false);

onMounted(() => {
  mounted.value = true;
  if (import.meta.client) {
    const storedValue = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    sidebarCollapsed.value = storedValue === 'true';
  }
});

watch(sidebarCollapsed, (value) => {
  if (mounted.value && import.meta.client) {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(value));
  }
});

const activeTheme = computed(() => {
  return mounted.value ? colorMode.value : 'light';
});

const navIcons: Record<string, any> = {
  '/dashboard': Gauge,
  '/admin/users': Users,
  '/admin/roles': Shield,
  '/admin/permissions': KeyRound,
};

async function handleLogout() {
  logoutPending.value = true;

  try {
    await logout();
  } finally {
    logoutPending.value = false;
    logoutDialogOpen.value = false;
    await navigateTo('/login');
  }
}

function toggleTheme() {
  colorMode.value = activeTheme.value === 'dark' ? 'light' : 'dark';
}

function isActiveRoute(href: string) {
  return route.path === href || route.path.startsWith(`${href}/`);
}
</script>

<template>
  <div
    :class="cn(
      'flex min-h-screen flex-col bg-background text-foreground transition-[grid-template-columns] duration-200 ease-out lg:h-screen lg:overflow-hidden lg:grid',
      sidebarCollapsed
        ? 'lg:grid-cols-[77px_minmax(0,1fr)]'
        : 'lg:grid-cols-[220px_minmax(0,1fr)]',
    )"
  >
    <!-- Desktop Sidebar -->
    <aside class="hidden shrink-0 flex-col overflow-hidden border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex lg:h-screen">
      <div
        :class="cn(
          'flex h-[77px] shrink-0 items-center border-b border-border py-5 transition-[padding] duration-200 ease-out',
          sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-6',
        )"
      >
        <button
          v-if="sidebarCollapsed"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="展开侧边栏"
          @click="sidebarCollapsed = false"
        >
          <PanelLeftOpen class="h-4 w-4" />
        </button>
        <template v-else>
          <div class="font-syne text-2xl font-extrabold uppercase tracking-[-0.02em] text-foreground">
            URP
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="折叠侧边栏"
            @click="sidebarCollapsed = true"
          >
            <PanelLeftClose class="h-4 w-4" />
          </button>
        </template>
      </div>

      <div class="flex-1 overflow-y-auto">
        <nav class="flex flex-col gap-1 p-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.href"
            :to="item.href"
            :aria-label="item.label"
            :class="cn(
              'inline-flex h-10 items-center whitespace-nowrap border text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isActiveRoute(item.href)
                ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border-transparent bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              sidebarCollapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-3 px-4',
            )"
          >
            <component :is="navIcons[item.href]" class="h-4 w-4 shrink-0" />
            <span v-if="!sidebarCollapsed" class="truncate text-xs">{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:h-screen">
      <!-- Header -->
      <header class="flex h-[77px] shrink-0 items-center border-b border-border bg-background/95 px-6 py-5 backdrop-blur-sm lg:px-8" :class="headerCenter ? 'justify-between' : 'justify-between'">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:hidden"
            aria-label="打开导航菜单"
            @click="mobileSidebarOpen = true"
          >
            <PanelLeftOpen class="h-4 w-4" />
          </button>
        </div>

        <div v-if="headerCenter" class="flex-1 flex items-center justify-center px-6">
          <slot name="headerCenter" />
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            :aria-label="activeTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
            @click="toggleTheme"
          >
            <Sun v-if="activeTheme === 'dark'" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="进入用户中心"
            @click="navigateTo('/user')"
          >
            <CircleUser class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border border-primary bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="退出登录"
            @click="logoutDialogOpen = true"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="min-h-0 flex-1 overflow-y-auto">
        <div class="px-6 py-8 lg:px-8 lg:py-10">
          <slot />
        </div>
      </main>
    </div>

    <!-- Logout Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="logoutDialogOpen"
      title="确认退出登录"
      description="退出后将结束当前会话，并返回登录页。"
      confirm-label="退出登录"
      :pending="logoutPending"
      @confirm="handleLogout"
    />
  </div>
</template>
