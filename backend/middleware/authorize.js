import { hasPermission, filterDataByRole } from '../utils/permissions.js';

// Check if user has permission for a resource action
export const authorize = (resource, action) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }

    // Bypass checks for admins (optional - set STRICT_RBAC=true to enforce for all)
    if (process.env.STRICT_RBAC !== 'true' && req.user.role === 'admin') {
      return next();
    }

    // Check if user has permission
    if (!hasPermission(req.user.role, resource, action)) {
      return res.status(403).json({
        message: `Forbidden: You do not have permission to ${action} ${resource}`,
        resource,
        action,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Middleware to filter response data based on user role
export const filterResponse = (resource) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (data && (Array.isArray(data) || typeof data === 'object')) {
        // Filter the data if it's user data
        if (data.data) {
          data.data = filterDataByRole(data.data, req.user?.role || 'viewer', resource);
        } else if (Array.isArray(data)) {
          data = filterDataByRole(data, req.user?.role || 'viewer', resource);
        } else if (data._id) {
          // Single document
          data = filterDataByRole(data, req.user?.role || 'viewer', resource)[0];
        }
      }

      return originalJson(data);
    };

    next();
  };
};

// Middleware to check jurisdiction-level access (LGU users see only their region/city)
export const checkJurisdiction = (userIdField = 'organizationId') => {
  return (req, res, next) => {
    // Only applies to LGU and viewer roles
    if (req.user.role === 'admin') {
      return next();
    }

    // For LGU users, add filter to query
    if (req.user.role === 'lgu') {
      if (req.user.jurisdiction) {
        // Store jurisdiction in req for use in route handlers
        req.jurisdictionFilter = {
          $or: [
            { jurisdiction: req.user.jurisdiction },
            { city: req.user.jurisdiction },
            { region: req.user.jurisdiction },
            { lgu: req.user.jurisdiction },
          ],
        };
      }
    }

    next();
  };
};

export default {
  authorize,
  filterResponse,
  checkJurisdiction,
};
