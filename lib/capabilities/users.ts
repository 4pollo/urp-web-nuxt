import { PERMISSION_KEYS } from '../permission-keys';
import { hasAny } from './shared';

export function getUserCapabilities(
  permissions: string[] | undefined,
  superAdmin: boolean,
) {
  return {
    canAccessUsers:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.user.read]),
    canCreateUser:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.user.write]),
    canUpdateUser:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.user.write]),
    canUpdateUserStatus:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.user.updateStatus]),
    canDeleteUser:
      superAdmin || hasAny(permissions, [PERMISSION_KEYS.user.delete]),
    canAssignUserRoles: superAdmin,
  };
}
