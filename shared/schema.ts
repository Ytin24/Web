import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("manager"), // 'super_admin', 'manager'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(), // SHA-256 hash of token
  tokenPrefix: varchar("token_prefix", { length: 12 }).notNull(), // First 8 chars for identification (tk_xxxxxxxx)
  name: text("name").notNull(), // Token description
  permissions: text("permissions").notNull(), // JSON array of permissions
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
  ipWhitelist: text("ip_whitelist"), // JSON array of allowed IPs (optional)
  rateLimit: integer("rate_limit").default(1000), // requests per hour
  usageCount: integer("usage_count").notNull().default(0),
  revokedAt: timestamp("revoked_at"), // Timestamp when token was revoked
  revokedBy: integer("revoked_by").references(() => users.id), // Who revoked the token
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
