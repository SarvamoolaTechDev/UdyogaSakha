/**
 * Decodes a JWT payload (base64url) without verifying the signature.
 * Used client-side only to extract userId from the access token.
 * Verification happens server-side on every request.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → decode
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return (payload?.sub as string) ?? null;
}
