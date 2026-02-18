// Permission utilities for role-based access control

/**
 * Role hierarchy:
 * - admin: Super admin with full access
 * - viewer: Read-only access + can create LGU user accounts
 * - lgu: Can create and read data, cannot update or delete
 */

export const ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
  LGU: 'lgu',
};

// Check if user can create data (fisherfolk, boats, organizations, etc.)
export const canCreate = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.LGU;
};

// Check if user can update data
export const canUpdate = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN;
};

// Check if user can delete data
export const canDelete = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN;
};

// Check if user can read/view data (all roles can read)
export const canRead = (user) => {
  if (!user || !user.role) return false;
  return true; // All authenticated users can read
};

// Check if user can manage user accounts
export const canManageUsers = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.VIEWER;
};

// Check if user can create user accounts
export const canCreateUsers = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.VIEWER;
};

// Check if user can create LGU users specifically (viewers can only create LGU users)
export const canCreateLGUUsers = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.VIEWER;
};

// Check if user can create admin users (only admins can)
export const canCreateAdminUsers = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN;
};

// Check if user is admin
export const isAdmin = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN;
};

// Check if user is viewer
export const isViewer = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.VIEWER;
};

// Check if user is LGU
export const isLGU = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.LGU;
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Super Admin';
    case ROLES.VIEWER:
      return 'Viewer';
    case ROLES.LGU:
      return 'LGU User';
    default:
      return role;
  }
};
