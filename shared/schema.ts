import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { ColorSchemeName } from "./color-palette";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("employee"), // 'super_admin', 'admin', 'manager', 'employee'
  permissions: text("permissions").default("[]"), // JSON array of specific permissions
  isActive: boolean("is_active").default(true),
  mustChangePassword: boolean("must_change_password").default(false),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lastFailedLogin: timestamp("last_failed_login"),
  accountLockedUntil: timestamp("account_locked_until"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  createdBy: integer("created_by").references(() => users.id),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(), // SHA-256 hash of token
  tokenPrefix: varchar("token_prefix", { length: 12 }).notNull(), // First 8 chars for identification (tk_xxxxxxxx)
  name: text("name").notNull(), // Token description
  permissions: text("permissions").notNull(), // JSON array of permissions
  expiresAt: timestamp("expires_at").notNull(), // All tokens must have expiration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
  ipWhitelist: text("ip_whitelist"), // JSON array of allowed IPs (optional)
  rateLimit: integer("rate_limit").default(100), // Reduced default rate limit
  usageCount: integer("usage_count").notNull().default(0),
  revokedAt: timestamp("revoked_at"), // Timestamp when token was revoked
  revokedBy: integer("revoked_by").references(() => users.id), // Who revoked the token
});

// Security audit log table
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(), // 'login', 'logout', 'failed_login', 'token_created', etc.
  userId: integer("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"), // JSON string with additional details
  severity: text("severity").notNull().default("info"), // 'info', 'warning', 'error', 'critical'
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions table
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token", { length: 64 }).notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'hero', 'about', 'loyalty', etc.
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // JSON string for flexible content
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category").notNull(), // 'wedding', 'corporate', 'birthday', etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callbackRequests = pgTable("callback_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  callTime: text("call_time"),
  status: text("status").notNull().default("pending"), // 'pending', 'contacted', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  loyaltyLevel: text("loyalty_level").notNull().default("bronze"), // 'bronze', 'silver', 'gold', 'platinum'
  notes: text("notes"), // Дополнительные заметки о клиенте
  totalOrders: integer("total_orders").notNull().default(0),
  lastOrderDate: timestamp("last_order_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyProgram = pgTable("loyalty_program", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), // 'beginner', 'connoisseur', 'vip'
  title: text("title").notNull(),
  description: text("description"),
  minAmount: integer("min_amount").notNull(),
  maxAmount: integer("max_amount"),
  discount: integer("discount").notNull(),
  benefits: text("benefits"), // JSON array
  isActive: boolean("is_active").default(true),
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(), // 'hero', 'about', 'portfolio', 'blog', 'general'
  description: text("description"),
  altText: text("alt_text"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales CRM Table
// Products table for catalog management
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'roses', 'tulips', 'arrangements', 'plants', etc.
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Keep existing sales table for backward compatibility, add new fields
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"), // New field
  productName: text("product_name").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  saleDate: timestamp("sale_date").defaultNow(),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull().default("cash"), // 'cash', 'card', 'transfer', 'other'
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'cancelled', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
  // New field to link to multi-product sales
  isMultiProduct: boolean("is_multi_product").default(false),
});

// Sale items table - many products per sale
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(), // Store name for historical data even if product is deleted
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"), // Item-specific notes
});

// Relations for the new multi-product sales system
import { relations } from "drizzle-orm";

export const salesRelations = relations(sales, ({ many }) => ({
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  saleItems: many(saleItems),
}));

// Settings Table for tax rates and other configurations
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  isActive: true,
});

export const insertApiTokenSchema = createInsertSchema(apiTokens).pick({
  userId: true,
  tokenHash: true,
  tokenPrefix: true,
  name: true,
  permissions: true,
  expiresAt: true,
  isActive: true,
  ipWhitelist: true,
  rateLimit: true,
});

export const createTokenRequestSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(['read', 'write', 'admin'])).min(1),
  expiresAt: z.string().datetime().optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  rateLimit: z.number().min(1).max(10000).default(1000),
});

export const insertSectionSchema = createInsertSchema(sections).pick({
  name: true,
  title: true,
  description: true,
  content: true,
  imageUrl: true,
  isActive: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  excerpt: true,
  content: true,
  imageUrl: true,
  category: true,
  isPublished: true,
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).pick({
  title: true,
  description: true,
  imageUrl: true,
  category: true,
  isActive: true,
});

export const insertCallbackRequestSchema = createInsertSchema(callbackRequests).pick({
  name: true,
  phone: true,
  message: true,
  callTime: true,
});

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyProgram).pick({
  level: true,
  title: true,
  description: true,
  minAmount: true,
  maxAmount: true,
  discount: true,
  benefits: true,
  isActive: true,
});

export const insertImageSchema = createInsertSchema(images).pick({
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  url: true,
  category: true,
  description: true,
  altText: true,
  isActive: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  phone: true,
  loyaltyLevel: true,
  notes: true,
  totalOrders: true,
  lastOrderDate: true,
});

// Updated insert schemas for new multi-product system
export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  description: true,
  basePrice: true,
  imageUrl: true,
  isActive: true,
});

export const insertSaleItemSchema = createInsertSchema(saleItems).pick({
  saleId: true,
  productId: true,
  productName: true,
  quantity: true,
  unitPrice: true,
  subtotal: true,
  notes: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  customerName: true,
  customerPhone: true,
  customerEmail: true,
  productName: true,
  quantity: true,
  unitPrice: true,
  subtotal: true,
  taxAmount: true,
  totalAmount: true,
  saleDate: true,
  notes: true,
  paymentMethod: true,
  status: true,
  isMultiProduct: true,
});

// Schema for creating multi-product sales
export const createMultiProductSaleSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  items: z.array(z.object({
    productName: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    notes: z.string().optional(),
  })).min(1),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'other']).default('cash'),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).default('completed'),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
  description: true,
});

// Site Settings table for color scheme and other global settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // 'colorScheme', 'siteName', etc.
  value: text("value").notNull(), // JSON string for complex values
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;

export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;
export type CallbackRequest = typeof callbackRequests.$inferSelect;

export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;
export type LoyaltyProgram = typeof loyaltyProgram.$inferSelect;

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;
export type ApiToken = typeof apiTokens.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Enhanced sale type with items included
export type SaleWithItems = Sale & {
  items: SaleItem[];
};

// New security schemas
export const insertSecurityLogSchema = createInsertSchema(securityLogs).pick({
  event: true,
  userId: true,
  ipAddress: true,
  userAgent: true,
  details: true,
  severity: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).pick({
  userId: true,
  sessionToken: true,
  ipAddress: true,
  userAgent: true,
  expiresAt: true,
  isActive: true,
});

// Enhanced user schema with security validations
export const insertUserSchemaSecure = createInsertSchema(users).extend({
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Пароль должен содержать: строчные и заглавные буквы, цифры, специальные символы"),
  email: z.string().email("Неверный формат email").optional(),
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа")
    .regex(/^[a-zA-Z0-9_]+$/, "Имя пользователя может содержать только буквы, цифры и подчеркивания"),
}).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  permissions: true,
  isActive: true,
  mustChangePassword: true,
  createdBy: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(8, "Новый пароль должен содержать минимум 8 символов")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Пароль должен содержать: строчные и заглавные буквы, цифры, специальные символы"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

// New types
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// Permission constants
export const PERMISSIONS = {
  BLOG_READ: 'blog:read',
  BLOG_WRITE: 'blog:write',
  BLOG_DELETE: 'blog:delete',
  PORTFOLIO_READ: 'portfolio:read',
  PORTFOLIO_WRITE: 'portfolio:write',
  PORTFOLIO_DELETE: 'portfolio:delete',
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  CUSTOMERS_DELETE: 'customers:delete',
  CRM_READ: 'crm:read',
  CRM_WRITE: 'crm:write',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  TOKENS_READ: 'tokens:read',
  TOKENS_WRITE: 'tokens:write',
  TOKENS_DELETE: 'tokens:delete',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  SECURITY_READ: 'security:read',
} as const;

// Role definitions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.BLOG_READ, PERMISSIONS.BLOG_WRITE, PERMISSIONS.BLOG_DELETE,
    PERMISSIONS.PORTFOLIO_READ, PERMISSIONS.PORTFOLIO_WRITE, PERMISSIONS.PORTFOLIO_DELETE,
    PERMISSIONS.CUSTOMERS_READ, PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
    PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE,
    PERMISSIONS.TOKENS_READ, PERMISSIONS.TOKENS_WRITE,
    PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_WRITE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.BLOG_READ, PERMISSIONS.BLOG_WRITE,
    PERMISSIONS.PORTFOLIO_READ, PERMISSIONS.PORTFOLIO_WRITE,
    PERMISSIONS.CUSTOMERS_READ, PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
    PERMISSIONS.SETTINGS_READ,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.BLOG_READ,
    PERMISSIONS.PORTFOLIO_READ,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CRM_READ,
  ]
} as const;
