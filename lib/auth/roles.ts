export const USER_ROLES = ["admin", "editor", "reviewer", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ["read", "write", "approve", "publish", "manage_sources", "manage_users"],
  editor: ["read", "write", "approve"],
  reviewer: ["read", "approve"],
  viewer: ["read"]
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canApprove(role: UserRole): boolean {
  return hasPermission(role, "approve");
}

export function canPublish(role: UserRole): boolean {
  return hasPermission(role, "publish");
}

export function canManageSources(role: UserRole): boolean {
  return hasPermission(role, "manage_sources");
}
