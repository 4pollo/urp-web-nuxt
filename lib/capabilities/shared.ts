import { PERMISSION_KEYS } from '../permission-keys';

export type KnownPermissionKey =
  | (typeof PERMISSION_KEYS.user)[keyof typeof PERMISSION_KEYS.user]
  | (typeof PERMISSION_KEYS.role)[keyof typeof PERMISSION_KEYS.role]
  | (typeof PERMISSION_KEYS.permission)[keyof typeof PERMISSION_KEYS.permission]
  | (typeof PERMISSION_KEYS.system)[keyof typeof PERMISSION_KEYS.system];

export function isSuperAdmin(
  roles: Array<string | { name: string }> | undefined,
) {
  if (!roles) return false;

  return roles.some((role) =>
    typeof role === 'string'
      ? role === 'SuperAdmin'
      : role.name === 'SuperAdmin',
  );
}

export function hasAny(
  permissions: string[] | undefined,
  required: readonly string[],
) {
  if (!permissions || required.length === 0) {
    return false;
  }

  return required.some((permission) => permissions.includes(permission));
}

export function hasAll(
  permissions: string[] | undefined,
  required: readonly string[],
) {
  if (!permissions || required.length === 0) {
    return false;
  }

  return required.every((permission) => permissions.includes(permission));
}
