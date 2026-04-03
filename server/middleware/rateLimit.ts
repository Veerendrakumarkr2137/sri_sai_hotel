import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
};

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

export function rateLimit(options: RateLimitOptions) {
  const hits = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
    const windowMs = options.windowMs;

    let entry = hits.get(key);
    if (!entry || entry.resetTime <= now) {
      entry = { count: 0, resetTime: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(options.max - entry.count, 0);
    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetTime / 1000)));

    if (entry.count > options.max) {
      return res.status(429).json({
        success: false,
        error: options.message || "Too many requests. Please try again later.",
      });
    }

    if (hits.size > 10000) {
      for (const [storedKey, storedEntry] of hits.entries()) {
        if (storedEntry.resetTime <= now) {
          hits.delete(storedKey);
        }
      }
    }

    return next();
  };
}
