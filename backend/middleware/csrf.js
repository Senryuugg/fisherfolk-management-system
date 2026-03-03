import crypto from 'crypto';

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF token
export const generateCSRFToken = (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.session?.id || req.ip;
    csrfTokens.set(token, { sessionId, createdAt: Date.now() });
    
    // Clean up old tokens (older than 1 hour)
    for (const [key, value] of csrfTokens.entries()) {
      if (Date.now() - value.createdAt > 60 * 60 * 1000) {
        csrfTokens.delete(key);
      }
    }
    
    return token;
  } catch (error) {
    console.error('[v0] Error generating CSRF token:', error);
    throw error;
  }
};

// Verify CSRF token
export const verifyCSRFToken = (req, res, next) => {
  // Skip verification for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for health checks and public endpoints
  if (req.path === '/health' || req.path.includes('/public')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body?.csrfToken;

  if (!token) {
    return res.status(403).json({
      message: 'CSRF token missing',
    });
  }

  if (!csrfTokens.has(token)) {
    return res.status(403).json({
      message: 'Invalid or expired CSRF token',
    });
  }

  // Token is valid, delete it after use (single-use tokens)
  csrfTokens.delete(token);
  next();
};

// Middleware to attach CSRF token to response
export const attachCSRFToken = (req, res, next) => {
  res.locals.csrfToken = generateCSRFToken(req, res);
  next();
};

export default {
  generateCSRFToken,
  verifyCSRFToken,
  attachCSRFToken,
};
