export const PERMISSION_KEYS = {
  user: {
    read: 'user:read',
    write: 'user:write',
    delete: 'user:delete',
    updateStatus: 'user:update-status',
  },
  role: {
    read: 'role:read',
    write: 'role:write',
    delete: 'role:delete',
  },
  permission: {
    read: 'permission:read',
    write: 'permission:write',
    delete: 'permission:delete',
  },
  system: {
    manage: 'system:manage',
  },
} as const;

export const SYSTEM_PERMISSION_KEYS = [
  'user:read',
  'user:write',
  'user:delete',
  'user:update-status',
  'role:read',
  'role:write',
  'role:delete',
  'permission:read',
  'permission:write',
  'permission:delete',
  'system:manage',
] as const;
