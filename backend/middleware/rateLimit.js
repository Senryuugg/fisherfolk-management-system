import rateLimit from 'express-rate-limit';

// General API rate limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks or internal requests
    return req.path === '/health';
  },
});

// Strict limiter for login attempts: 5 requests per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful requests
});

// Strict limiter for registration: 3 requests per hour per IP
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: 'Too many account creation attempts, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limiter for data creation: 30 requests per 15 minutes per IP
export const createDataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 create requests
  message: 'Too many data creation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  createDataLimiter,
};
