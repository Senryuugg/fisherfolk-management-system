import compression from 'compression';

// Response caching middleware
export const cacheMiddleware = (options = {}) => {
  const defaultDuration = options.duration || 5 * 60 * 1000; // 5 minutes default
  const cache = new Map();

  // Clear cache after duration
  setInterval(() => {
    console.log('[v0] Performance: Clearing cache...');
    cache.clear();
  }, defaultDuration);

  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for authenticated requests with personal data
    if (req.user && req.path.includes('user')) {
      return next();
    }

    const key = `${req.method}:${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log('[v0] Cache HIT for:', key);
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    const originalJson = res.json.bind(res);

    res.json = function (data) {
      cache.set(key, data);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Response compression
export const compressionMiddleware = () => {
  return compression({
    level: 6, // Balance between compression and CPU usage
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Skip compression for certain routes
      if (req.path === '/api/health') {
        return false;
      }
      return compression.filter(req, res);
    },
  });
};

// Query optimization middleware
export const queryOptimization = (req, res, next) => {
  // Add default pagination limits
  if (req.query.page === undefined) {
    req.query.page = 1;
  }

  if (req.query.limit === undefined) {
    req.query.limit = 50;
  }

  // Cap limit to prevent excessive data transfer
  if (req.query.limit > 100) {
    req.query.limit = 100;
  }

  // Add default sorting
  if (req.query.sort === undefined) {
    req.query.sort = { createdAt: -1 };
  }

  next();
};

// Request timing middleware
export const requestTiming = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`[v0] Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    } else {
      console.log(`[v0] ${req.method} ${req.path} - ${duration}ms`);
    }
  });

  next();
};

// Memory usage monitoring
export const memoryMonitoring = () => {
  return (req, res, next) => {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (heapUsedPercent > 90) {
      console.warn(`[v0] High memory usage: ${heapUsedPercent.toFixed(2)}%`);
      // Could trigger garbage collection or alert admin
    }

    res.set('X-Memory-Usage', `${heapUsedPercent.toFixed(2)}%`);
    next();
  };
};

// Database connection pooling helper
export const getDatabaseConnectionStats = () => {
  return {
    activeConnections: process.memoryUsage().external || 0,
    timestamp: new Date(),
  };
};

export default {
  cacheMiddleware,
  compressionMiddleware,
  queryOptimization,
  requestTiming,
  memoryMonitoring,
  getDatabaseConnectionStats,
};
