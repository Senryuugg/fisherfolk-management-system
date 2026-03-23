/**
 * ABAC + PBAC Hybrid — FARMC System
 *
 * ABAC (Attribute-Based):  checks user.role, user.department, user.city against the resource
 * PBAC (Policy-Based):     each policy function encapsulates what a role CAN do on a resource
 *
 * ROLES:
 *   admin          — super admin, full access to everything
 *   bfar_supervisor— BFAR dept: full CRUD, manage all users, approve/reject, view audit log
 *   bfar_viewer    — BFAR dept: read-only; cannot write, manage users, or see audit log
 *   lgu_supervisor — LGU dept:  CRUD within their city, manage LGU users, approve LGU editors
 *   lgu_editor     — LGU dept:  create/edit within their city (submissions go to approval queue)
 */

// ─── Role constants ────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:           'admin',
  BFAR_SUPERVISOR: 'bfar_supervisor',
  BFAR_VIEWER:     'bfar_viewer',
  LGU_SUPERVISOR:  'lgu_supervisor',
  LGU_EDITOR:      'lgu_editor',
};

// ─── Basic role predicates ─────────────────────────────────────────────────────
export const isAdmin          = (user) => user?.role === ROLES.ADMIN;
export const isBfarSupervisor = (user) => user?.role === ROLES.BFAR_SUPERVISOR;
export const isBfarViewer     = (user) => user?.role === ROLES.BFAR_VIEWER;
export const isLguSupervisor  = (user) => user?.role === ROLES.LGU_SUPERVISOR;
export const isLguEditor      = (user) => user?.role === ROLES.LGU_EDITOR;

export const isBfarDepartment = (user) =>
  [ROLES.BFAR_SUPERVISOR, ROLES.BFAR_VIEWER].includes(user?.role);
export const isLguDepartment  = (user) =>
  [ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR].includes(user?.role);

/** Top-level admin-tier: admin or bfar_supervisor */
export const isTopAdmin = (user) =>
  [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR].includes(user?.role);

// ─── PBAC: Data CRUD policies ──────────────────────────────────────────────────

/** All authenticated roles can read data */
export const canRead = (user) => !!user?.role;

/**
 * ABAC create policy:
 *  - admin, bfar_supervisor, lgu_supervisor → create directly, saved immediately
 *  - lgu_editor                             → can create but submission goes to approval queue
 *  - bfar_viewer                            → cannot create
 */
export const canCreate = (user) => {
  if (!user?.role) return false;
  return [
    ROLES.ADMIN,
    ROLES.BFAR_SUPERVISOR,
    ROLES.LGU_SUPERVISOR,
    ROLES.LGU_EDITOR,
  ].includes(user.role);
};

/** Whether this role's creates require approval (ABAC: role attribute check) */
export const createRequiresApproval = (user) => user?.role === ROLES.LGU_EDITOR;

/**
 * ABAC update policy:
 *  - admin, bfar_supervisor → update any record
 *  - lgu_supervisor         → update records within their city attribute
 *  - lgu_editor             → update records (edit + renew their own submissions)
 *  - bfar_viewer            → cannot update
 *  Legacy values lgu / lgu_admin / lgu_user / officer are also granted update
 */
export const canUpdate = (user) => {
  if (!user?.role) return false;
  const lguRoles = [
    ROLES.ADMIN, ROLES.BFAR_SUPERVISOR, ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR,
    // legacy aliases — in case localStorage hasn't been refreshed yet
    'lgu', 'lgu_admin', 'lgu_user', 'officer',
  ];
  return lguRoles.includes(user.role);
};

/**
 * PBAC delete policy:
 *  Only admin and bfar_supervisor may delete records.
 */
export const canDelete = (user) => {
  if (!user?.role) return false;
  return [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR].includes(user.role);
};

// ─── PBAC: User management policies ───────────────────────────────────────────

export const canManageUsers  = (user) =>
  [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR, ROLES.LGU_SUPERVISOR].includes(user?.role);

export const canCreateUsers  = (user) => canManageUsers(user);

/**
 * ABAC: which roles this user is allowed to assign (role-scope restriction)
 */
export const getCreatableRoles = (user) => {
  switch (user?.role) {
    case ROLES.ADMIN:
      return [
        ROLES.ADMIN,
        ROLES.BFAR_SUPERVISOR,
        ROLES.BFAR_VIEWER,
        ROLES.LGU_SUPERVISOR,
        ROLES.LGU_EDITOR,
      ];
    case ROLES.BFAR_SUPERVISOR:
      return [
        ROLES.BFAR_SUPERVISOR,
        ROLES.BFAR_VIEWER,
        ROLES.LGU_SUPERVISOR,
        ROLES.LGU_EDITOR,
      ];
    case ROLES.LGU_SUPERVISOR:
      return [ROLES.LGU_EDITOR];
    default:
      return [];
  }
};

// ─── PBAC: Approval policy ─────────────────────────────────────────────────────

/**
 * admin and bfar_supervisor can approve/reject any submission.
 * lgu_supervisor can approve/reject submissions within their city.
 */
export const canApprove = (user) =>
  [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR, ROLES.LGU_SUPERVISOR].includes(user?.role);

// ─── PBAC: Audit log policy ────────────────────────────────────────────────────

/** Only admin and bfar_supervisor can view audit logs */
export const canViewAuditLog = (user) =>
  [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR].includes(user?.role);

// ─── Display helpers ───────────────────────────────────────────────────────────

export const getRoleDisplayName = (role) => {
  const names = {
    [ROLES.ADMIN]:           'Admin',
    [ROLES.BFAR_SUPERVISOR]: 'BFAR Supervisor',
    [ROLES.BFAR_VIEWER]:     'BFAR Viewer',
    [ROLES.LGU_SUPERVISOR]:  'LGU Supervisor',
    [ROLES.LGU_EDITOR]:      'LGU Editor',
    // Legacy labels
    lgu:        'LGU (Legacy)',
    viewer:     'Viewer (Legacy)',
    bfar_admin: 'BFAR Admin (Legacy)',
    bfar_user:  'BFAR User (Legacy)',
    lgu_admin:  'LGU Admin (Legacy)',
    lgu_user:   'LGU User (Legacy)',
  };
  return names[role] || role || 'Unknown';
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]:           { bg: '#fee2e2', text: '#991b1b' },
    [ROLES.BFAR_SUPERVISOR]: { bg: '#dbeafe', text: '#1e40af' },
    [ROLES.BFAR_VIEWER]:     { bg: '#e0f2fe', text: '#0369a1' },
    [ROLES.LGU_SUPERVISOR]:  { bg: '#dcfce7', text: '#166534' },
    [ROLES.LGU_EDITOR]:      { bg: '#fefce8', text: '#854d0e' },
  };
  return colors[role] || { bg: '#f3f4f6', text: '#6b7280' };
};

export const getDepartmentFromRole = (role) => {
  if (role === ROLES.ADMIN) return 'admin';
  if ([ROLES.BFAR_SUPERVISOR, ROLES.BFAR_VIEWER].includes(role)) return 'bfar';
  if ([ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR].includes(role)) return 'lgu';
  return '';
};
