import { PERMISSION_KEYS } from '../permission-keys';
import { hasAny } from './shared';

export function getPermissionCapabilities(
  permissions: string[] | undefined,
  superAdmin: boolean,
) {
  return {
    canAccessPermissions:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.permission.read]),
    canCreatePermission: superAdmin,
    canUpdatePermission: superAdmin,
    canDeletePermission: superAdmin,
  };
}
