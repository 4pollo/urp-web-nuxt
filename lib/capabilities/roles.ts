import { PERMISSION_KEYS } from '../permission-keys';
import { hasAny } from './shared';

export function getRoleCapabilities(
  permissions: string[] | undefined,
  superAdmin: boolean,
) {
  return {
    canAccessRoles:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.role.read]),
    canCreateRole:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.role.write]),
    canUpdateRole:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.role.write]),
    canDeleteRole:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.role.delete]),
    canAssignRolePermissions: superAdmin,
  };
}
