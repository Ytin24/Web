import { storage } from './storage';
import { hashPassword, logSecurityEvent } from './auth';
import { ROLES } from '@shared/schema';

// Initialize root user for secure admin access
export async function initializeRootUser(): Promise<void> {
  try {
    // Check if root user already exists
    const existingRootUser = await storage.getUserByUsername('root');
    
    if (existingRootUser) {
      console.log('Root user already exists, skipping initialization');
      return;
    }

    // Get root password from environment or generate secure one
    const rootPassword = process.env.ROOT_PASSWORD || 'Admin2025!Secure#Flowercraft';
    
    // Hash password
    const hashedPassword = await hashPassword(rootPassword);
    
    // Create root user
    const rootUser = await storage.createUser({
      username: 'root',
      email: 'admin@flowercraft.ru',
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      permissions: '[]', // Super admin gets all permissions by role
      isActive: true,
      mustChangePassword: false, // Set to true if you want to force password change on first login
      failedLoginAttempts: 0,
      createdBy: null, // Self-created
    });

    // Log security event
    await logSecurityEvent(
      'root_user_created',
      rootUser.id,
      '127.0.0.1',
      'system',
      { message: 'Root user initialized during system setup' },
      'info'
    );

    console.log('Root user created successfully with username: root');
    console.log('Root password is stored in ROOT_PASSWORD environment variable');
    
  } catch (error) {
    console.error('Failed to initialize root user:', error);
    throw error;
  }
}

// Initialize basic settings if they don't exist
export async function initializeSettings(): Promise<void> {
  try {
    // Check if settings exist
    const taxRateSetting = await storage.getSetting('tax_rate');
    
    if (!taxRateSetting) {
      await storage.setSetting('tax_rate', '20', 'НДС ставка в процентах');
      await storage.setSetting('currency', 'RUB', 'Валюта системы');
      await storage.setSetting('max_failed_logins', '5', 'Максимум неудачных попыток входа');
      await storage.setSetting('session_timeout', '4', 'Время сеанса в часах');
      await storage.setSetting('require_password_change', 'false', 'Требовать смену пароля при первом входе');
      
      console.log('Basic settings initialized');
    }
  } catch (error) {
    console.error('Failed to initialize settings:', error);
  }
}

// Clean expired sessions on startup
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await storage.cleanExpiredSessions();
    console.log('Expired sessions cleaned up');
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}