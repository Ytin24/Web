import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { rateLimit, validateInput, loginUserSecure, logoutUserSecure, authenticateToken } from './auth';
import { storage } from './storage';
import type { AuthRequest } from './auth';

const router = Router();

// Login schema validation
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(200),
});

// Login endpoint with enhanced security
router.post('/login', 
  rateLimit(15 * 60 * 1000, 10), // 10 attempts per 15 minutes
  validateInput(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const result = await loginUserSecure(username, password, req);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Login successful',
          token: result.token,
          sessionToken: result.sessionToken,
          user: result.user
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// Logout endpoint
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sessionToken = req.headers['x-session-token'] as string;
    
    if (sessionToken) {
      await logoutUserSecure(sessionToken, req);
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Remove sensitive information
    const { password, ...userProfile } = req.user;
    
    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if session is still valid
    const sessionToken = req.headers['x-session-token'] as string;
    if (sessionToken) {
      const session = await storage.getUserSession(sessionToken);
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return res.status(401).json({
          success: false,
          error: 'Session expired'
        });
      }
    }

    // For now, just return current user - token refresh can be implemented later
    const { password, ...userProfile } = req.user;
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

// Check authentication status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        isActive: req.user.isActive
      }
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      authenticated: false,
      error: 'Failed to check authentication status'
    });
  }
});

// Получить всех пользователей (только для super_admin)
router.get('/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуется роль super_admin.'
      });
    }

    const users = await storage.getAllUsers();
    // Удаляем пароли из ответа
    const safeUsers = users.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить список пользователей'
    });
  }
});

// Обновить пользователя (с защитой root'а)
router.put('/users/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуется роль super_admin.'
      });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID пользователя'
      });
    }

      // Защита от самоблокировки root-пользователя
    const targetUser = await storage.getUserById(userId);
    if (targetUser?.username === 'root' && req.body.isActive === false) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя деактивировать root-пользователя - это заблокирует доступ к системе'
      });
    }

    const updatedUser = await storage.updateUser(userId, req.body);
    const { password, ...safeUser } = updatedUser;
    
    res.json({
      success: true,
      message: 'Пользователь успешно обновлен',
      user: safeUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось обновить пользователя'
    });
  }
});

// Деактивировать пользователя (с защитой root'а)
router.post('/users/:id/deactivate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуется роль super_admin.'
      });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID пользователя'
      });
    }

    // Дополнительная защита на уровне API
    const targetUser = await storage.getUserById(userId);
    if (targetUser?.username === 'root') {
      return res.status(403).json({
        success: false,
        error: 'Нельзя деактивировать root-пользователя - это заблокирует доступ к системе'
      });
    }

    await storage.deactivateUser(userId);
    
    res.json({
      success: true,
      message: 'Пользователь успешно деактивирован'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось деактивировать пользователя'
    });
  }
});

// Разблокировать пользователя
router.post('/users/:id/unlock', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуется роль super_admin.'
      });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID пользователя'
      });
    }

    await storage.unlockUserAccount(userId);
    
    res.json({
      success: true,
      message: 'Пользователь успешно разблокирован'
    });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось разблокировать пользователя'
    });
  }
});

export default router;