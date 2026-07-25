import rateLimit from 'express-rate-limit';

// ─── Auth Rate Limiter ─────────────────────────────────────────────────────────
// Prevents brute-force attacks on login/register
export const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             10,
  message:         { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: true,
});

// ─── General API Rate Limiter ─────────────────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  message:         { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
