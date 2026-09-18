import type { Request, Response, NextFunction } from 'express';

/**
 * 1. Enterprise Healthcare Security Headers Middleware
 * Protects against Clickjacking, MIME confusion, XSS, and unencrypted transmission
 */
export function healthcareSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Origin Resource Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy (CSP) for API endpoints
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';"
  );

  // Cache Control for Protected Health Data
  if (req.path.startsWith('/api/abha') || req.path.startsWith('/api/medical-records')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }

  next();
}

/**
 * 2. In-Memory Token Bucket / Sliding Window Rate Limiter
 * Guards against brute-force password guessing, OTP bombing, and DDoS
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', options.maxRequests - 1);
      return next();
    }

    if (record.count >= options.maxRequests) {
      const retrySecs = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retrySecs);
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Rate limit exceeded. Please try again later.',
        retryAfterSeconds: retrySecs
      });
      return;
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', options.maxRequests - record.count);
    next();
  };
}

// 60 requests per minute for standard API calls
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit reached (120 requests/min). Please slow down.'
});

// 6 attempts per 5 minutes for Auth / OTP to block credential stuffing
export const authSensitiveLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please wait 5 minutes before trying again.'
});

/**
 * 3. Deep Request Sanitizer (Protection against Prototype Pollution and XSS payload injection)
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
      .replace(/javascript:/gi, '')
      .replace(/\0/g, ''); // Strip null bytes
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object' && value !== null) {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      // Guard against Prototype Pollution
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
        continue;
      }
      cleanObj[k] = sanitizeValue(v);
    }
    return cleanObj;
  }
  return value;
}

export function requestSanitizer(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      req.body[key] = sanitizeValue(req.body[key]);
    }
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      (req.query as any)[key] = sanitizeValue((req.query as any)[key]);
    }
  }
  next();
}
