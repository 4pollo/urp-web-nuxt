import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getMyMenu } from '~/lib/auth';
import type { MenuItem, NavItem } from '~/lib/types';

const MENU_CACHE_KEY = 'app:cached-menu';
const MENU_CACHE_DURATION = 60 * 60 * 1000; // 1小时

function getCachedMenu(): MenuItem[] | null {
  if (!import.meta.client) return null;

  try {
    const cached = window.localStorage.getItem(MENU_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > MENU_CACHE_DURATION) {
      window.localStorage.removeItem(MENU_CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCachedMenu(menu: MenuItem[]) {
  if (!import.meta.client) return;

  try {
    window.localStorage.setItem(
      MENU_CACHE_KEY,
      JSON.stringify({ data: menu, timestamp: Date.now() })
    );
  } catch {
    // ignore
  }
}

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref<MenuItem[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const navItems = computed<NavItem[]>(() => {
    // 控制台页面对所有用户可见，硬编码在最前面
    const dashboardItem: NavItem = {
      href: '/dashboard',
      label: '控制台',
      icon: 'gauge',
    };

    if (!Array.isArray(menuItems.value)) {
      return [dashboardItem];
    }

    // 过滤掉从后端返回的控制台项（如果有的话），避免重复
    const dynamicItems = menuItems.value
      .filter(item => item.menuPath !== '/dashboard')
      .map(item => ({
        href: item.menuPath,
        label: item.menuLabel,
        icon: item.menuIcon,
      }));

    return [dashboardItem, ...dynamicItems];
  });

  const loadMenu = async (forceRefresh = false) => {
    if (!forceRefresh && import.meta.client) {
      const cached = getCachedMenu();
      if (cached) {
        menuItems.value = cached;
        loading.value = false;
        return;
      }
    }

    loading.value = true;
    try {
      const result = await getMyMenu();
      const menuData = result?.items || [];
      menuItems.value = menuData;
      if (import.meta.client) {
        setCachedMenu(menuData);
      }
      error.value = null;
    } catch (err) {
      menuItems.value = [];
      error.value = err instanceof Error ? err.message : '获取菜单失败';
    } finally {
      loading.value = false;
    }
  };

  const reload = async () => {
    await loadMenu(true);
  };

  return {
    menuItems,
    navItems,
    loading,
    error,
    loadMenu,
    reload,
  };
});
