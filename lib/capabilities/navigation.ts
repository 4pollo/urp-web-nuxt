import { PERMISSION_KEYS } from '../permission-keys';
import type { NavItem } from '../types';
import { hasAny } from './shared';

export const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: '控制台',
  },
  {
    href: '/admin/users' as const,
    label: '用户管理',
    permission: PERMISSION_KEYS.user.read,
  },
  {
    href: '/admin/roles' as const,
    label: '角色管理',
    permission: PERMISSION_KEYS.role.read,
  },
  {
    href: '/admin/permissions' as const,
    label: '权限管理',
    permission: PERMISSION_KEYS.permission.read,
  },
];

export function getAccessibleNavItems(
  permissions: string[] | undefined,
  superAdmin: boolean,
): NavItem[] {
  return navItems.filter((item) =>
    !item.permission || superAdmin || hasAny(permissions, [item.permission])
  );
}
