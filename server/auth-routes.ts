import { Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { 
  hashPassword, 
  verifyPassword, 
  generateJwtToken, 
  generateApiToken,
  authenticateToken, 
  requireRole,
  validateInput,
  rateLimit,
  type AuthRequest 
} from './auth';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  role: z.enum(['super_admin', 'manager']).default('manager')
});

const createApiTokenSchema = z.object({
  name: z.string().min(1),
  permissions: z.array(z.string()).default(['read']),
  expiresInDays: z.number().min(1).max(365).optional()
});

export function setupAuthRoutes(app: Express) {
  
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: User login
   *     description: Authenticate user and return JWT token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username:
   *                 type: string
   *                 example: admin
   *               password:
   *                 type: string
   *                 example: password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   */
  app.post('/api/auth/login', 
    rateLimit(15 * 60 * 1000, 10), // 10 attempts per 15 minutes
    validateInput(loginSchema),
    async (req, res) => {
      try {
        const { username, password } = req.body;
        
        const user = await storage.getUserByUsername(username);
        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        const token = generateJwtToken(user);
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ token, user: userWithoutPassword });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  );

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Authentication]
   *     summary: Get current user
   *     description: Get current authenticated user information
   *     security:
   *       - BearerAuth: []
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: User information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  /**
   * @swagger
   * /api/auth/users:
   *   post:
   *     tags: [User Management]
   *     summary: Create new user
   *     description: Create a new user account (super admin only)
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *               password:
   *                 type: string
   *                 minLength: 8
   *               role:
   *                 type: string
   *                 enum: [super_admin, manager]
   *                 default: manager
   *     responses:
   *       201:
   *         description: User created successfully
   *       403:
   *         description: Insufficient permissions
   */
  app.post('/api/auth/users',
    authenticateToken,
    requireRole(['super_admin']),
    validateInput(createUserSchema),
    async (req: AuthRequest, res) => {
      try {
        const { username, password, role } = req.body;
        
        // Check if user exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await hashPassword(password);
        const user = await storage.createUser({
          username,
          password: hashedPassword,
          role,
          isActive: true
        });
        
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  );

  /**
   * @swagger
   * /api/auth/users:
   *   get:
   *     tags: [User Management]
   *     summary: Get all users
   *     description: Get list of all users (super admin only)
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Users list
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  app.get('/api/auth/users',
    authenticateToken,
    requireRole(['super_admin']),
    async (req: AuthRequest, res) => {
      try {
        const users = await storage.getAllUsers();
        const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
        res.json(usersWithoutPasswords);
      } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
      }
    }
  );

  /**
   * @swagger
   * /api/auth/api-tokens:
   *   post:
   *     tags: [API Tokens]
   *     summary: Create API token
   *     description: Create a new API token for external integrations
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *                 example: N8N Integration
   *               permissions:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: [read, write]
   *               expiresInDays:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 365
   *                 example: 90
   *     responses:
   *       201:
   *         description: API token created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 apiToken:
   *                   $ref: '#/components/schemas/ApiToken'
   */
  app.post('/api/auth/api-tokens',
    authenticateToken,
    requireRole(['super_admin', 'manager']),
    validateInput(createApiTokenSchema),
    async (req: AuthRequest, res) => {
      try {
        const { name, permissions, expiresInDays } = req.body;
        
        const token = generateApiToken();
        const expiresAt = expiresInDays 
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
          : null;
        
        const apiToken = await storage.createApiToken({
          userId: req.user!.id,
          token,
          name,
          permissions: JSON.stringify(permissions),
          expiresAt,
          isActive: true
        });
        
        res.status(201).json({ token, apiToken });
      } catch (error) {
        console.error('API token creation error:', error);
        res.status(500).json({ error: 'Failed to create API token' });
      }
    }
  );

  /**
   * @swagger
   * /api/auth/api-tokens:
   *   get:
   *     tags: [API Tokens]
   *     summary: Get API tokens
   *     description: Get list of API tokens for current user
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: API tokens list
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 allOf:
   *                   - $ref: '#/components/schemas/ApiToken'
   *                   - type: object
   *                     properties:
   *                       token:
   *                         type: string
   *                         description: Token value is masked for security
   *                         example: tk_abc***_***789
   */
  app.get('/api/auth/api-tokens',
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const tokens = await storage.getApiTokensByUserId(req.user!.id);
        
        // Mask tokens for security
        const maskedTokens = tokens.map(token => ({
          ...token,
          token: token.token.replace(/(.{6})(.*)(.{6})/, '$1***$3')
        }));
        
        res.json(maskedTokens);
      } catch (error) {
        console.error('Get API tokens error:', error);
        res.status(500).json({ error: 'Failed to get API tokens' });
      }
    }
  );

  /**
   * @swagger
   * /api/auth/api-tokens/{id}:
   *   delete:
   *     tags: [API Tokens]
   *     summary: Revoke API token
   *     description: Revoke an API token
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: API token ID
   *     responses:
   *       200:
   *         description: Token revoked successfully
   *       404:
   *         description: Token not found
   */
  app.delete('/api/auth/api-tokens/:id',
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const tokenId = parseInt(req.params.id);
        
        // Only allow users to revoke their own tokens or super admin to revoke any
        const token = await storage.getApiTokenById(tokenId);
        if (!token) {
          return res.status(404).json({ error: 'Token not found' });
        }
        
        if (token.userId !== req.user!.id && req.user!.role !== 'super_admin') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        await storage.revokeApiToken(tokenId);
        res.json({ message: 'Token revoked successfully' });
      } catch (error) {
        console.error('Token revocation error:', error);
        res.status(500).json({ error: 'Failed to revoke token' });
      }
    }
  );
}