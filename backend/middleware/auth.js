import jwt from 'jsonwebtoken';

/**
 * ABAC + PBAC Hybrid Middleware
 *
 * Roles:
 *   admin           — full access
 *   bfar_supervisor — full data CRUD + manage users + approve + audit log
 *   bfar_viewer     — read-only
 *   lgu_supervisor  — CRUD within city + manage LGU users + approve LGU editors
 *   lgu_editor      — create/edit within city (goes to approval queue)
 *
 * Legacy role mapping (transparently upgrades old tokens):
 *   lgu        → lgu_supervisor
 *   viewer     → bfar_viewer
 *   bfar_admin → bfar_supervisor
 *   bfar_user  → bfar_viewer
 *   lgu_admin  → lgu_supervisor
 *   lgu_user   → lgu_editor
 *   officer    → lgu_editor
 */
const LEGACY_ROLE_MAP = {
  lgu:            'lgu_supervisor',
  viewer:         'bfar_viewer',
  officer:        'lgu_editor',
  bfar_admin:     'bfar_supervisor',
  bfar_user:      'bfar_viewer',
  lgu_admin:      'lgu_supervisor',
  lgu_user:       'lgu_editor',
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    if (user.role && LEGACY_ROLE_MAP[user.role]) {
      user.role = LEGACY_ROLE_MAP[user.role];
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// ─── Policy sets ──────────────────────────────────────────────────────────────
const ALL_ROLES        = ['admin', 'bfar_supervisor', 'bfar_viewer', 'lgu_supervisor', 'lgu_editor'];
const WRITE_ROLES      = ['admin', 'bfar_supervisor', 'lgu_supervisor', 'lgu_editor'];
const UPDATE_ROLES     = ['admin', 'bfar_supervisor', 'lgu_supervisor'];
const DELETE_ROLES     = ['admin', 'bfar_supervisor'];
const MANAGE_USER_ROLES= ['admin', 'bfar_supervisor', 'lgu_supervisor'];
const APPROVE_ROLES    = ['admin', 'bfar_supervisor', 'lgu_supervisor'];
const AUDIT_ROLES      = ['admin', 'bfar_supervisor'];

// ─── Exported policy middlewares ──────────────────────────────────────────────
export const canRead          = authorizeRole(ALL_ROLES);
export const canCreate        = authorizeRole(WRITE_ROLES);
export const canUpdate        = authorizeRole(UPDATE_ROLES);
export const canDelete        = authorizeRole(DELETE_ROLES);
export const canManageUsers   = authorizeRole(MANAGE_USER_ROLES);
export const canApprove       = authorizeRole(APPROVE_ROLES);
export const canViewAuditLog  = authorizeRole(AUDIT_ROLES);
