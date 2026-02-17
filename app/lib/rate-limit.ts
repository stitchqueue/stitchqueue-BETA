/**
 * In-memory IP-based rate limiter for public API endpoints.
 *
 * Uses a simple sliding-window counter stored in a Map.
 * State is per-process — resets on deploy/restart. This is acceptable
 * for a small SaaS; for higher scale, swap to Vercel KV or Upstash Redis.
 *
 * @module lib/rate-limit
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Extract client IP from request headers.
 * Vercel sets x-forwarded-for; fallback to x-real-ip or 'unknown'.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Prefix for the store key (e.g. 'intake', 'feedback') */
  prefix: string;
}

/**
 * Check rate limit for a request. Returns null if allowed,
 * or a 429 NextResponse if the limit is exceeded.
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  cleanup();

  const ip = getClientIp(request);
  const key = `${options.prefix}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (entry.count >= options.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  entry.count++;
  return null;
}
