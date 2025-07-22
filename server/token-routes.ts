import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IStorage } from './storage';
import { 
  generateSecureToken, 
  verifyToken, 
  validateTokenFormat, 
  extractTokenPrefix,
  createSecurityAuditLog,
  isTokenExpired,
  generateExpirationDate,
  validateIPAddress
} from './token-utils';
import { createTokenRequestSchema } from '@shared/schema';
import type { ApiToken, InsertApiToken } from '@shared/schema';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
  apiToken?: ApiToken;
}

/**
 * Secure token management routes with comprehensive security measures
 */
export function createTokenRoutes(storage: IStorage): Router {
  const router = Router();

  /**
   * Create new API token
   * POST /api/tokens
   */
  router.post('/tokens', async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate request body
      const validation = createTokenRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validation.error.errors
        });
      }

      const { name, permissions, expiresAt, ipWhitelist, rateLimit } = validation.data;

      // Generate secure token
      const { token, tokenHash, tokenPrefix } = generateSecureToken();

      // Create expiration date
      const expirationDate = expiresAt 
        ? new Date(expiresAt)
        : generateExpirationDate(90); // Default 90 days

      // Validate IP whitelist if provided
      if (ipWhitelist && ipWhitelist.length > 0) {
        for (const ip of ipWhitelist) {
          if (!validateIPAddress(ip)) {
            return res.status(400).json({ 
              error: 'Invalid IP address in whitelist',
              details: `Invalid IP: ${ip}`
            });
          }
        }
      }

      // Create token in database
      const tokenData: InsertApiToken = {
        userId: req.user.id,
        tokenHash,
        tokenPrefix,
        name,
        permissions: JSON.stringify(permissions),
        expiresAt: expirationDate,
        ipWhitelist: ipWhitelist ? JSON.stringify(ipWhitelist) : null,
        rateLimit: rateLimit || 1000,
        isActive: true
      };

      const createdToken = await storage.createApiToken(tokenData);

      // Security audit log
      createSecurityAuditLog({
        event: 'token_created',
        tokenPrefix,
        userId: req.user.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        success: true,
        details: `Token "${name}" created with permissions: ${permissions.join(', ')}`
      });

      // Return token data (only once!)
      res.status(201).json({
        id: createdToken.id,
        token: token, // Full token returned ONLY on creation
        tokenPrefix: tokenPrefix,
        name: createdToken.name,
        permissions: JSON.parse(createdToken.permissions),
        expiresAt: createdToken.expiresAt,
        rateLimit: createdToken.rateLimit,
        createdAt: createdToken.createdAt,
        warning: 'Store this token securely. It will not be shown again.'
      });

    } catch (error) {
      console.error('Token creation error:', error);
      
      createSecurityAuditLog({
        event: 'token_created',
        tokenPrefix: 'unknown',
        userId: req.user?.id,
        ipAddress: req.ip || 'unknown',
        timestamp: new Date(),
        success: false,
        details: `Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      res.status(500).json({ error: 'Failed to create token' });
    }
  });

  /**
   * List user's API tokens
   * GET /api/tokens
   */
  router.get('/tokens', async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const tokens = await storage.getApiTokensByUserId(req.user.id);

      // Return safe token information (no full tokens or hashes)
      const safeTokens = tokens.map(token => ({
        id: token.id,
        tokenPrefix: token.tokenPrefix,
        name: token.name,
        permissions: JSON.parse(token.permissions),
        expiresAt: token.expiresAt,
        isActive: token.isActive,
        createdAt: token.createdAt,
        lastUsed: token.lastUsed,
        usageCount: token.usageCount,
        rateLimit: token.rateLimit,
        isExpired: isTokenExpired(token.expiresAt),
        revokedAt: token.revokedAt
      }));

      res.json(safeTokens);

    } catch (error) {
      console.error('Token listing error:', error);
      res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
  });

  /**
   * Get all tokens (admin only)
   * GET /api/admin/tokens
   */
  router.get('/admin/tokens', async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const tokens = await storage.getAllApiTokens();

      const safeTokens = tokens.map(token => ({
        id: token.id,
        userId: token.userId,
        tokenPrefix: token.tokenPrefix,
        name: token.name,
        permissions: JSON.parse(token.permissions),
        expiresAt: token.expiresAt,
        isActive: token.isActive,
        createdAt: token.createdAt,
        lastUsed: token.lastUsed,
        usageCount: token.usageCount,
        rateLimit: token.rateLimit,
        isExpired: isTokenExpired(token.expiresAt),
        revokedAt: token.revokedAt,
        revokedBy: token.revokedBy
      }));

      res.json(safeTokens);

    } catch (error) {
      console.error('Admin token listing error:', error);
      res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
  });

  /**
   * Revoke API token
   * DELETE /api/tokens/:id
   */
  router.delete('/tokens/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const tokenId = parseInt(req.params.id);
      if (!tokenId) {
        return res.status(400).json({ error: 'Invalid token ID' });
      }

      // Get token to verify ownership
      const token = await storage.getApiTokenById(tokenId);
      if (!token) {
        return res.status(404).json({ error: 'Token not found' });
      }

      // Check ownership (users can only revoke their own tokens, admins can revoke any)
      if (token.userId !== req.user.id && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Revoke token
      await storage.revokeApiToken(tokenId, req.user.id);

      // Security audit log
      createSecurityAuditLog({
        event: 'token_revoked',
        tokenPrefix: token.tokenPrefix,
        userId: req.user.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        success: true,
        details: `Token "${token.name}" revoked by ${req.user.username}`
      });

      res.json({ 
        message: 'Token revoked successfully',
        tokenPrefix: token.tokenPrefix 
      });

    } catch (error) {
      console.error('Token revocation error:', error);
      res.status(500).json({ error: 'Failed to revoke token' });
    }
  });

  /**
   * Token validation endpoint for testing
   * POST /api/tokens/validate
   */
  router.post('/validate', async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token || !validateTokenFormat(token)) {
        return res.status(400).json({ 
          valid: false, 
          error: 'Invalid token format' 
        });
      }

      // Hash the provided token for database lookup
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const storedToken = await storage.getApiTokenByHash(tokenHash);
      
      if (!storedToken) {
        return res.status(401).json({ 
          valid: false, 
          error: 'Token not found' 
        });
      }

      // Check if token is active
      if (!storedToken.isActive) {
        return res.status(401).json({ 
          valid: false, 
          error: 'Token has been revoked' 
        });
      }

      // Check if token is expired
      if (isTokenExpired(storedToken.expiresAt)) {
        return res.status(401).json({ 
          valid: false, 
          error: 'Token has expired' 
        });
      }

      // Verify IP whitelist if configured
      const clientIP = req.ip || req.connection.remoteAddress;
      if (storedToken.ipWhitelist && clientIP) {
        const allowedIPs = JSON.parse(storedToken.ipWhitelist);
        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
          createSecurityAuditLog({
            event: 'unauthorized_access',
            tokenPrefix: storedToken.tokenPrefix,
            ipAddress: clientIP,
            timestamp: new Date(),
            success: false,
            details: `IP ${clientIP} not in whitelist`
          });

          return res.status(403).json({ 
            valid: false, 
            error: 'IP address not authorized' 
          });
        }
      }

      // Update last used timestamp
      await storage.updateApiTokenLastUsed(storedToken.id, true);

      // Security audit log
      createSecurityAuditLog({
        event: 'token_used',
        tokenPrefix: storedToken.tokenPrefix,
        userId: storedToken.userId,
        ipAddress: clientIP || 'unknown',
        timestamp: new Date(),
        success: true
      });

      res.json({
        valid: true,
        tokenPrefix: storedToken.tokenPrefix,
        permissions: JSON.parse(storedToken.permissions),
        rateLimit: storedToken.rateLimit
      });

    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ error: 'Validation failed' });
    }
  });

  return router;
}

/**
 * Middleware for API token authentication
 */
export function apiTokenAuth(storage: IStorage) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Let other auth methods handle it
      }

      const token = authHeader.substring(7);

      if (!validateTokenFormat(token)) {
        return res.status(401).json({ error: 'Invalid token format' });
      }

      // Hash the token for database lookup
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const storedToken = await storage.getApiTokenByHash(tokenHash);

      if (!storedToken || !storedToken.isActive) {
        return res.status(401).json({ error: 'Invalid or revoked token' });
      }

      if (isTokenExpired(storedToken.expiresAt)) {
        return res.status(401).json({ error: 'Token expired' });
      }

      // Check IP whitelist
      const clientIP = req.ip;
      if (storedToken.ipWhitelist && clientIP) {
        const allowedIPs = JSON.parse(storedToken.ipWhitelist);
        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
          createSecurityAuditLog({
            event: 'unauthorized_access',
            tokenPrefix: storedToken.tokenPrefix,
            ipAddress: clientIP,
            timestamp: new Date(),
            success: false,
            details: 'IP not in whitelist'
          });

          return res.status(403).json({ error: 'IP address not authorized' });
        }
      }

      // Update usage
      await storage.updateApiTokenLastUsed(storedToken.id, true);

      // Set token info for downstream middleware
      req.apiToken = storedToken;
      
      // Security audit log
      createSecurityAuditLog({
        event: 'token_used',
        tokenPrefix: storedToken.tokenPrefix,
        userId: storedToken.userId,
        ipAddress: clientIP || 'unknown',
        timestamp: new Date(),
        success: true
      });

      next();

    } catch (error) {
      console.error('API token auth error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  };
}