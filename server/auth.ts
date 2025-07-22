import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Environment variables validation
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthRequest extends Request {
  user?: User;
  apiToken?: string;
}

// Generate secure API token
export function generateApiToken(): string {
  return `tk_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateJwtToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
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
      const apiToken = await storage.getApiTokenByToken(token);
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