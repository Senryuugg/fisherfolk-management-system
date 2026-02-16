/**
 * Standard error response formatter
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string|object} error - Error details (optional)
 */
export const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  res.status(statusCode).json(response);
};

/**
 * Standard success response formatter
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data (optional)
 */
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Async error handler wrapper
 * @param {function} fn - Async function to wrap
 * @returns {function} - Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 * @param {object} res - Express response object
 * @param {array} errors - Validation errors array
 */
export const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.map((err) => ({
      field: err.field || err.path,
      message: err.message,
    })),
  });
};
