// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('[v0] Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Don't expose stack traces in production
  const response = {
    success: false,
    message: isProduction ? 'An error occurred' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ...response,
      message: 'Validation error',
      details: err.details || err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      ...response,
      message: 'Unauthorized access',
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      ...response,
      message: 'Forbidden',
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      ...response,
      message: 'Resource not found',
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.code === 11000) {
    return res.status(400).json({
      ...response,
      message: 'Database constraint violation',
    });
  }

  res.status(statusCode).json(response);
};

// Async error wrapper for route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  errorHandler,
  asyncHandler,
};
