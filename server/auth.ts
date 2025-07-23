import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User, SecurityLog, UserSession } from '@shared/schema';
import { PERMISSIONS, ROLES, ROLE_PERMISSIONS } from '@shared/schema';

// Environment variables validation
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h'; // Shorter session time for security
const SESSION_EXPIRES_IN = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface AuthRequest extends Request {
  user?: User;
  apiToken?: string;
  session?: UserSession;
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Security logging function
export async function logSecurityEvent(
  event: string,
  userId?: number,
  ipAddress?: string,
  userAgent?: string,
  details?: any,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): Promise<void> {
  try {
    await storage.createSecurityLog({
      event,
      userId,
      ipAddress,
      userAgent,
      details: details ? JSON.stringify(details) : undefined,
      severity,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Generate secure API token
export function generateApiToken(): string {
  return `tk_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}

// Hash password with higher salt rounds for security
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 14; // Higher salt rounds for better security
  return bcrypt.hash(password, saltRounds);
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчные буквы');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавные буквы');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать цифры');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Пароль должен содержать специальные символы (@$!%*?&)');
  }
  
  return { valid: errors.length === 0, errors };
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate JWT token with session info
export function generateJwtToken(user: User, sessionToken?: string): string {
  const payload = { 
    id: user.id, 
    username: user.username, 
    role: user.role,
    sessionToken,
    permissions: getUserPermissions(user)
  };
  const options = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET as string, options);
}

// Get user permissions based on role and individual permissions
export function getUserPermissions(user: User): string[] {
  const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
  const individualPermissions = user.permissions ? JSON.parse(user.permissions) : [];
  const allPermissions = [...rolePermissions, ...individualPermissions];
  return Array.from(new Set(allPermissions));
}

// Check if user has specific permission
export function hasPermission(user: User, permission: string): boolean {
  const permissions = getUserPermissions(user);
  return permissions.includes(permission);
}

// Verify JWT token
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Check for API token first
    if (token?.startsWith('tk_')) {
      const apiToken = await storage.getApiTokenByHash(token);
      if (!apiToken || !apiToken.isActive) {
        return res.status(401).json({ error: 'Invalid or inactive API token' });
      }
      
      // Check expiration
      if (apiToken.expiresAt && new Date() > apiToken.expiresAt) {
        return res.status(401).json({ error: 'API token expired' });
      }
      
      // Update last used
      await storage.updateApiTokenLastUsed(apiToken.id);
      
      // Get associated user
      const user = await storage.getUserById(apiToken.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Associated user not found or inactive' });
      }
      
      req.user = user;
      req.apiToken = token;
      return next();
    }
    
    // Check JWT token
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = verifyJwtToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const user = await storage.getUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Authorization middleware
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Rate limiting store (in-memory, should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `rate_limit:${ip}`;
    
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (current.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((current.resetTime - now) / 1000) 
      });
    }
    
    current.count++;
    next();
  };
}

// Input validation middleware
export function validateInput(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors || error.message 
      });
    }
  };
}

// CORS middleware with security headers
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://api-maps.yandex.ru https://mc.yandex.ru; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api-maps.yandex.ru https://mc.yandex.ru;");
  
  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

// Enhanced login function with comprehensive security
export async function loginUserSecure(username: string, password: string, req: Request): Promise<{
  success: boolean;
  user?: Omit<User, 'password'>;
  token?: string;
  sessionToken?: string;
  error?: string;
}> {
  const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  try {
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      await logSecurityEvent(
        'login_attempt_invalid_username',
        undefined,
        ipAddress,
        userAgent,
        { username },
        'warning'
      );
      return { success: false, error: 'Invalid credentials' };
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      await logSecurityEvent(
        'login_attempt_locked_account',
        user.id,
        ipAddress,
        userAgent,
        { lockedUntil: user.accountLockedUntil },
        'warning'
      );
      return { success: false, error: 'Account is locked due to multiple failed attempts' };
    }

    // Check if user is active
    if (!user.isActive) {
      await logSecurityEvent(
        'login_attempt_inactive_account',
        user.id,
        ipAddress,
        userAgent,
        {},
        'warning'
      );
      return { success: false, error: 'Account is inactive' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      // Increment failed attempts
      await storage.updateUserFailedLogin(user.id, true);
      
      // Check if we need to lock the account
      const updatedUser = await storage.getUserById(user.id);
      if (updatedUser && (updatedUser.failedLoginAttempts || 0) >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_TIME);
        await storage.lockUserAccount(user.id, lockUntil);
        
        await logSecurityEvent(
          'account_locked_max_attempts',
          user.id,
          ipAddress,
          userAgent,
          { attempts: updatedUser.failedLoginAttempts || 0, lockedUntil: lockUntil },
          'critical'
        );
        return { success: false, error: 'Account locked due to multiple failed attempts' };
      }

      await logSecurityEvent(
        'failed_login_attempt',
        user.id,
        ipAddress,
        userAgent,
        { attempts: updatedUser?.failedLoginAttempts || 0 },
        'warning'
      );
      return { success: false, error: 'Invalid credentials' };
    }

    // Reset failed attempts on successful login
    await storage.updateUserFailedLogin(user.id, false);
    
    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);
    
    await storage.createUserSession({
      userId: user.id,
      sessionToken,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
    });

    // Generate JWT with session
    const token = generateJwtToken(user, sessionToken);

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Log successful login
    await logSecurityEvent(
      'successful_login',
      user.id,
      ipAddress,
      userAgent,
      { sessionToken },
      'info'
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      token,
      sessionToken,
    };
  } catch (error) {
    await logSecurityEvent(
      'login_error',
      undefined,
      ipAddress,
      userAgent,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'error'
    );
    return { success: false, error: 'Login failed' };
  }
}

// Logout function with session cleanup
export async function logoutUserSecure(sessionToken: string, req: Request): Promise<void> {
  const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  try {
    const session = await storage.getUserSession(sessionToken);
    if (session) {
      await storage.deactivateUserSession(sessionToken);
      
      await logSecurityEvent(
        'user_logout',
        session.userId,
        ipAddress,
        userAgent,
        { sessionToken },
        'info'
      );
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}