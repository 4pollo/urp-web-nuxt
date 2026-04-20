import type { NavItem } from '../types';
import { navItems, getAccessibleNavItems } from './navigation';
import { getPermissionCapabilities } from './permissions';
import { getRoleCapabilities } from './roles';
import { hasAny, hasAll, isSuperAdmin } from './shared';
import { getUserCapabilities } from './users';

export { navItems, hasAny, hasAll, isSuperAdmin };

export type Capabilities = {
  isSuperAdmin: boolean;
  navItems: NavItem[];
  canAccessUsers: boolean;
  canAccessRoles: boolean;
  canAccessPermissions: boolean;
  canCreateUser: boolean;
  canUpdateUser: boolean;
  canUpdateUserStatus: boolean;
  canDeleteUser: boolean;
  canAssignUserRoles: boolean;
  canCreateRole: boolean;
  canUpdateRole: boolean;
  canDeleteRole: boolean;
  canAssignRolePermissions: boolean;
  canCreatePermission: boolean;
  canUpdatePermission: boolean;
  canDeletePermission: boolean;
};

export function getCapabilities(
  permissions: string[] | undefined,
  roles?: Array<string | { name: string }>,
): Capabilities {
  const superAdmin = isSuperAdmin(roles);
  const accessibleNavItems = getAccessibleNavItems(permissions, superAdmin);

  return {
    isSuperAdmin: superAdmin,
    navItems: accessibleNavItems,
    ...getUserCapabilities(permissions, superAdmin),
    ...getRoleCapabilities(permissions, superAdmin),
    ...getPermissionCapabilities(permissions, superAdmin),
  };
}
