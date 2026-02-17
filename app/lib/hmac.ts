import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ESTIMATE_APPROVAL_SECRET;

if (!SECRET) {
  console.error(
    'WARNING: ESTIMATE_APPROVAL_SECRET is not set. ' +
    'Estimate approval links will not work.'
  );
}

/**
 * Generate an HMAC-SHA256 token for a project ID.
 * Used to protect the public estimate approval endpoint.
 */
export function generateApprovalToken(projectId: string): string {
  if (!SECRET) {
    throw new Error('ESTIMATE_APPROVAL_SECRET environment variable is not set');
  }
  return createHmac('sha256', SECRET).update(projectId).digest('hex');
}

/**
 * Verify an HMAC token for a project ID using constant-time comparison.
 * Returns false if the secret is missing or the token doesn't match.
 */
export function verifyApprovalToken(projectId: string, token: string): boolean {
  if (!SECRET || !token) return false;

  const expected = generateApprovalToken(projectId);

  // Constant-time comparison to prevent timing attacks
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(token, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
