import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface GeneratedToken {
  token: string;
  tokenHash: string;
  tokenPrefix: string;
}

/**
 * Generates a cryptographically secure API token
 * Token format: tk_xxxxxxxx_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
 * Where:
 * - tk_ is the prefix for identification
 * - xxxxxxxx is 8 random chars for visual identification
 * - yyyyyyyy... is 32 random bytes (64 hex chars) for security
 */
export function generateSecureToken(): GeneratedToken {
  // Generate cryptographically secure random bytes
  const identifierBytes = crypto.randomBytes(4); // 8 hex chars
  const secretBytes = crypto.randomBytes(32); // 64 hex chars
  
  // Create the full token
  const identifier = identifierBytes.toString('hex');
  const secret = secretBytes.toString('hex');
  const token = `tk_${identifier}_${secret}`;
  
  // Create SHA-256 hash for database storage
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Store prefix for identification (tk_xxxxxxxx)
  const tokenPrefix = `tk_${identifier}`;
  
  return {
    token,
    tokenHash,
    tokenPrefix
  };
}

/**
 * Verifies a token against its hash using constant-time comparison
 */
export function verifyToken(providedToken: string, storedHash: string): boolean {
  if (!providedToken || !storedHash) {
    return false;
  }
  
  // Hash the provided token
  const providedHash = crypto.createHash('sha256').update(providedToken).digest('hex');
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(providedHash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
}

/**
 * Validates token format and structure
 */
export function validateTokenFormat(token: string): boolean {
  if (!token) return false;
  
  // Check token format: tk_xxxxxxxx_yyyyyyyy...
  const tokenPattern = /^tk_[a-f0-9]{8}_[a-f0-9]{64}$/;
  return tokenPattern.test(token);
}

/**
 * Extracts token prefix from full token for identification
 */
export function extractTokenPrefix(token: string): string | null {
  if (!validateTokenFormat(token)) {
    return null;
  }
  
  const parts = token.split('_');
  return `${parts[0]}_${parts[1]}`;
}

/**
 * Generates a secure random salt for additional security
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Rate limiting: Generate key for rate limit storage
 */
export function generateRateLimitKey(tokenPrefix: string, timeWindow: string): string {
  return `rate_limit:${tokenPrefix}:${timeWindow}`;
}

/**
 * IP validation utility
 */
export function validateIPAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLog {
  event: 'token_created' | 'token_used' | 'token_revoked' | 'token_expired' | 'unauthorized_access';
  tokenPrefix: string;
  userId?: number;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  details?: string;
}

/**
 * Create security audit log (this would typically be stored in a logging system)
 */
export function createSecurityAuditLog(log: SecurityAuditLog): void {
  // In production, this would write to a secure audit log system
  console.log('[SECURITY AUDIT]', {
    ...log,
    timestamp: log.timestamp.toISOString()
  });
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Generate secure expiration date (default 90 days, max 1 year)
 */
export function generateExpirationDate(days: number = 90): Date {
  const maxDays = 365; // Maximum 1 year
  const safeDays = Math.min(days, maxDays);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + safeDays);
  return expirationDate;
}