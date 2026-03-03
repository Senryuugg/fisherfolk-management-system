import AuditLog from '../models/AuditLog.js';

// Map HTTP methods and paths to audit actions
const getAuditAction = (method, path) => {
  if (path.includes('login')) return 'LOGIN';
  if (path.includes('logout')) return 'LOGOUT';
  if (path.includes('export')) return 'EXPORT';
  if (path.includes('import')) return 'IMPORT';

  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'GET':
      return 'READ';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'READ';
  }
};

// Audit logging middleware
export const auditLog = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log the request after response is sent
    logAudit(req, res, data).catch(err => {
      console.error('[v0] Error logging audit:', err);
    });

    return originalSend.call(this, data);
  };

  next();
};

async function logAudit(req, res, responseData) {
  try {
    // Skip logging for certain paths
    if (
      req.path === '/health' ||
      req.path.includes('/public') ||
      req.method === 'OPTIONS'
    ) {
      return;
    }

    // Don't log sensitive operations to themselves
    if (req.path === '/api/audit-logs' && req.method !== 'GET') {
      return;
    }

    const action = getAuditAction(req.method, req.path);
    const userId = req.user?._id;
    const username = req.user?.username || 'ANONYMOUS';

    // Extract resource name from path
    const pathParts = req.path.split('/').filter(Boolean);
    const resource = pathParts[pathParts.length - 1] || 'UNKNOWN';

    // Determine if request was successful
    const status = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE';

    const auditEntry = {
      userId: userId || null,
      username,
      action,
      resource,
      resourceId: req.params.id,
      description: `${req.method} ${req.path}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status,
    };

    // Log failed login attempts and unauthorized access
    if (req.path.includes('login') && status === 'FAILURE') {
      auditEntry.action = 'FAILED_LOGIN';
    }

    if (res.statusCode === 401) {
      auditEntry.action = 'UNAUTHORIZED_ACCESS';
    }

    if (res.statusCode === 403) {
      auditEntry.action = 'UNAUTHORIZED_ACCESS';
    }

    // Log the audit entry
    await AuditLog.create(auditEntry);
  } catch (error) {
    console.error('[v0] Audit logging error:', error);
    // Don't throw - let the request continue even if audit logging fails
  }
}

export default auditLog;
