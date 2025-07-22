import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  imageUrl: text("image_url").notNull(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
