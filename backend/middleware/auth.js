import jwt from 'jsonwebtoken';

// Middleware for authentication and authorization
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Role-based permissions
// Admin: Full access to everything
// Viewer: Read-only access + can create user accounts for LGU users
// LGU: Can create and read data, cannot delete or update

export const canCreate = authorizeRole(['admin', 'lgu']);
export const canUpdate = authorizeRole(['admin']);
export const canDelete = authorizeRole(['admin']);
export const canRead = authorizeRole(['admin', 'viewer', 'lgu']);
export const canManageUsers = authorizeRole(['admin', 'viewer']); // Viewer can only create LGU users
