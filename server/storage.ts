import { 
  users, sections, blogPosts, portfolioItems, callbackRequests, loyaltyProgram, images, apiTokens, customers, sales, settings,
  securityLogs, userSessions,
  type User, type InsertUser, type Section, type InsertSection,
  type BlogPost, type InsertBlogPost, type PortfolioItem, type InsertPortfolioItem,
  type CallbackRequest, type InsertCallbackRequest, type LoyaltyProgram, type InsertLoyaltyProgram,
  type Image, type InsertImage, type ApiToken, type InsertApiToken, type Customer, type InsertCustomer,
  type Sale, type InsertSale, type Setting, type InsertSetting,
  type SecurityLog, type InsertSecurityLog, type UserSession, type InsertUserSession
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc, asc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;

  // API Tokens
  getApiTokenById(id: number): Promise<ApiToken | undefined>;
  getApiTokenByHash(tokenHash: string): Promise<ApiToken | undefined>;
  getApiTokensByUserId(userId: number): Promise<ApiToken[]>;
  getAllApiTokens(): Promise<ApiToken[]>;
  createApiToken(token: InsertApiToken): Promise<ApiToken>;
  updateApiTokenLastUsed(id: number, incrementUsage?: boolean): Promise<void>;
  revokeApiToken(id: number, revokedBy: number): Promise<void>;
  deactivateApiToken(id: number): Promise<void>;

  // Sections
  getAllSections(): Promise<Section[]>;
  getSectionByName(name: string): Promise<Section | undefined>;
  updateSection(id: number, section: Partial<InsertSection>): Promise<Section>;
  createSection(section: InsertSection): Promise<Section>;

  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Portfolio Items
  getAllPortfolioItems(): Promise<PortfolioItem[]>;
  getActivePortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItemsByCategory(category: string): Promise<PortfolioItem[]>;
  getPortfolioItem(id: number): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: number, item: Partial<InsertPortfolioItem>): Promise<PortfolioItem>;
  deletePortfolioItem(id: number): Promise<void>;

  // Callback Requests
  getAllCallbackRequests(): Promise<CallbackRequest[]>;
  getCallbackRequest(id: number): Promise<CallbackRequest | undefined>;
  createCallbackRequest(request: InsertCallbackRequest): Promise<CallbackRequest>;
  updateCallbackRequest(id: number, data: Partial<InsertCallbackRequest>): Promise<CallbackRequest>;
  deleteCallbackRequest(id: number): Promise<void>;

  // Loyalty Program
  getAllLoyaltyLevels(): Promise<LoyaltyProgram[]>;
  getActiveLoyaltyLevels(): Promise<LoyaltyProgram[]>;
  getLoyaltyLevel(id: number): Promise<LoyaltyProgram | undefined>;
  updateLoyaltyLevel(id: number, level: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram>;
  createLoyaltyLevel(insertLoyaltyProgram: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  deleteLoyaltyLevel(id: number): Promise<void>;

  // Images
  getAllImages(): Promise<Image[]>;
  getImagesByCategory(category: string): Promise<Image[]>;
  getActiveImages(): Promise<Image[]>;
  getImage(id: number): Promise<Image | undefined>;
  getImageByFilename(filename: string): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  updateImage(id: number, image: Partial<InsertImage>): Promise<Image>;
  deleteImage(id: number): Promise<void>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Sales CRM
  getAllSales(): Promise<Sale[]>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale>;
  deleteSale(id: number): Promise<void>;
  getSalesStats(): Promise<{ totalSales: number, totalRevenue: number, avgOrderValue: number }>;

  // Settings
  getAllSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string, description?: string): Promise<Setting>;
  updateSetting(id: number, setting: Partial<InsertSetting>): Promise<Setting>;
  deleteSetting(id: number): Promise<void>;

  // Security Logs
  getAllSecurityLogs(): Promise<SecurityLog[]>;
  getSecurityLogsByUserId(userId: number): Promise<SecurityLog[]>;
  getSecurityLogsByEvent(event: string): Promise<SecurityLog[]>;
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;

  // User Sessions
  getAllUserSessions(): Promise<UserSession[]>;
  getActiveUserSessions(): Promise<UserSession[]>;
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  getUserSessionsByUserId(userId: number): Promise<UserSession[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSessionLastActivity(sessionToken: string): Promise<void>;
  deactivateUserSession(sessionToken: string): Promise<void>;
  deactivateAllUserSessions(userId: number): Promise<void>;
  cleanExpiredSessions(): Promise<void>;

  // Enhanced User methods for security
  updateUserFailedLogin(id: number, increment?: boolean): Promise<void>;
  updateUserPassword(id: number, passwordHash: string): Promise<void>;
  lockUserAccount(id: number, lockUntil: Date): Promise<void>;
  unlockUserAccount(id: number): Promise<void>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deactivateUser(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // API Tokens
  async getApiTokenById(id: number): Promise<ApiToken | undefined> {
    const [token] = await db.select().from(apiTokens).where(eq(apiTokens.id, id));
    return token || undefined;
  }

  async getApiTokenByHash(tokenHash: string): Promise<ApiToken | undefined> {
    const [apiToken] = await db.select().from(apiTokens).where(eq(apiTokens.tokenHash, tokenHash));
    return apiToken || undefined;
  }

  async getAllApiTokens(): Promise<ApiToken[]> {
    return db.select().from(apiTokens);
  }

  async getApiTokensByUserId(userId: number): Promise<ApiToken[]> {
    return db.select().from(apiTokens).where(eq(apiTokens.userId, userId));
  }

  async createApiToken(insertToken: InsertApiToken): Promise<ApiToken> {
    const [token] = await db
      .insert(apiTokens)
      .values(insertToken)
      .returning();
    return token;
  }

  async updateApiTokenLastUsed(id: number, incrementUsage: boolean = true): Promise<void> {
    const updateData: any = { lastUsed: new Date() };
    if (incrementUsage) {
      // Use SQL to increment usage count atomically
      await db
        .update(apiTokens)
        .set({ 
          lastUsed: new Date(),
          usageCount: sql`${apiTokens.usageCount} + 1`
        })
        .where(eq(apiTokens.id, id));
    } else {
      await db
        .update(apiTokens)
        .set(updateData)
        .where(eq(apiTokens.id, id));
    }
  }

  async revokeApiToken(id: number, revokedBy: number): Promise<void> {
    await db
      .update(apiTokens)
      .set({ 
        isActive: false,
        revokedAt: new Date(),
        revokedBy: revokedBy
      })
      .where(eq(apiTokens.id, id));
  }

  async deactivateApiToken(id: number): Promise<void> {
    await db
      .update(apiTokens)
      .set({ isActive: false })
      .where(eq(apiTokens.id, id));
  }

  // Sections
  async getAllSections(): Promise<Section[]> {
    return await db.select().from(sections);
  }

  async getSectionByName(name: string): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.name, name));
    return section || undefined;
  }

  async updateSection(id: number, sectionData: Partial<InsertSection>): Promise<Section> {
    const [updatedSection] = await db
      .update(sections)
      .set(sectionData)
      .where(eq(sections.id, id))
      .returning();
    return updatedSection;
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const [section] = await db
      .insert(sections)
      .values(insertSection)
      .returning();
    return section;
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(blogPosts.createdAt);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(insertBlogPost)
      .returning();
    return post;
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set(postData)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Portfolio Items
  async getAllPortfolioItems(): Promise<PortfolioItem[]> {
    return await db.select().from(portfolioItems).orderBy(portfolioItems.createdAt);
  }

  async getActivePortfolioItems(): Promise<PortfolioItem[]> {
    return await db.select().from(portfolioItems).where(eq(portfolioItems.isActive, true)).orderBy(portfolioItems.createdAt);
  }

  async getPortfolioItemsByCategory(category: string): Promise<PortfolioItem[]> {
    return await db.select().from(portfolioItems).where(eq(portfolioItems.category, category)).orderBy(portfolioItems.createdAt);
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
    return item || undefined;
  }

  async createPortfolioItem(insertPortfolioItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const [item] = await db
      .insert(portfolioItems)
      .values(insertPortfolioItem)
      .returning();
    return item;
  }

  async updatePortfolioItem(id: number, itemData: Partial<InsertPortfolioItem>): Promise<PortfolioItem> {
    const [updatedItem] = await db
      .update(portfolioItems)
      .set(itemData)
      .where(eq(portfolioItems.id, id))
      .returning();
    return updatedItem;
  }

  async deletePortfolioItem(id: number): Promise<void> {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  }

  // Callback Requests
  async getAllCallbackRequests(): Promise<CallbackRequest[]> {
    return await db.select().from(callbackRequests).orderBy(callbackRequests.createdAt);
  }

  async getCallbackRequest(id: number): Promise<CallbackRequest | undefined> {
    const [request] = await db.select().from(callbackRequests).where(eq(callbackRequests.id, id));
    return request || undefined;
  }

  async createCallbackRequest(insertCallbackRequest: InsertCallbackRequest): Promise<CallbackRequest> {
    const [request] = await db
      .insert(callbackRequests)
      .values(insertCallbackRequest)
      .returning();
    return request;
  }

  async updateCallbackRequest(id: number, data: Partial<InsertCallbackRequest>): Promise<CallbackRequest> {
    const [updatedRequest] = await db
      .update(callbackRequests)
      .set(data)
      .where(eq(callbackRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteCallbackRequest(id: number): Promise<void> {
    await db.delete(callbackRequests).where(eq(callbackRequests.id, id));
  }

  // Loyalty Program
  async getAllLoyaltyLevels(): Promise<LoyaltyProgram[]> {
    return await db.select().from(loyaltyProgram);
  }

  async getActiveLoyaltyLevels(): Promise<LoyaltyProgram[]> {
    return await db.select().from(loyaltyProgram).where(eq(loyaltyProgram.isActive, true));
  }

  async getLoyaltyLevel(id: number): Promise<LoyaltyProgram | undefined> {
    const [level] = await db.select().from(loyaltyProgram).where(eq(loyaltyProgram.id, id));
    return level || undefined;
  }

  async updateLoyaltyLevel(id: number, levelData: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram> {
    const [updatedLevel] = await db
      .update(loyaltyProgram)
      .set(levelData)
      .where(eq(loyaltyProgram.id, id))
      .returning();
    return updatedLevel;
  }

  async createLoyaltyLevel(insertLoyaltyProgram: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const [level] = await db
      .insert(loyaltyProgram)
      .values(insertLoyaltyProgram)
      .returning();
    return level;
  }

  async deleteLoyaltyLevel(id: number): Promise<void> {
    await db.delete(loyaltyProgram).where(eq(loyaltyProgram.id, id));
  }

  // Images
  async getAllImages(): Promise<Image[]> {
    return await db.select().from(images);
  }

  async getImagesByCategory(category: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.category, category));
  }

  async getActiveImages(): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.isActive, true));
  }

  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async getImageByFilename(filename: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.filename, filename));
    return image || undefined;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values(insertImage)
      .returning();
    return image;
  }

  async updateImage(id: number, imageData: Partial<InsertImage>): Promise<Image> {
    const [updatedImage] = await db
      .update(images)
      .set(imageData)
      .where(eq(images.id, id))
      .returning();
    return updatedImage;
  }

  async deleteImage(id: number): Promise<void> {
    await db.delete(images).where(eq(images.id, id));
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.createdAt);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customerData)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Sales CRM
  async getAllSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(sales.saleDate);
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return await db.select().from(sales)
      .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)))
      .orderBy(sales.saleDate);
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || undefined;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db
      .insert(sales)
      .values(insertSale)
      .returning();
    return sale;
  }

  async updateSale(id: number, saleData: Partial<InsertSale>): Promise<Sale> {
    const [updatedSale] = await db
      .update(sales)
      .set(saleData)
      .where(eq(sales.id, id))
      .returning();
    return updatedSale;
  }

  async deleteSale(id: number): Promise<void> {
    await db.delete(sales).where(eq(sales.id, id));
  }

  async getSalesStats(): Promise<{ totalSales: number, totalRevenue: number, avgOrderValue: number }> {
    const result = await db.select({
      totalSales: sql<number>`count(*)`,
      totalRevenue: sql<number>`sum(${sales.totalAmount})`,
      avgOrderValue: sql<number>`avg(${sales.totalAmount})`,
    }).from(sales).where(eq(sales.status, 'completed'));
    
    const stats = result[0];
    return {
      totalSales: Number(stats.totalSales) || 0,
      totalRevenue: Number(stats.totalRevenue) || 0,
      avgOrderValue: Number(stats.avgOrderValue) || 0,
    };
  }

  // Settings
  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(key: string, value: string, description?: string): Promise<Setting> {
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      const [updated] = await db
        .update(settings)
        .set({ value, description, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values({ key, value, description })
        .returning();
      return created;
    }
  }

  async updateSetting(id: number, settingData: Partial<InsertSetting>): Promise<Setting> {
    const [updatedSetting] = await db
      .update(settings)
      .set({ ...settingData, updatedAt: new Date() })
      .where(eq(settings.id, id))
      .returning();
    return updatedSetting;
  }

  async deleteSetting(id: number): Promise<void> {
    await db.delete(settings).where(eq(settings.id, id));
  }

  // Security Logs implementation
  async getAllSecurityLogs(): Promise<SecurityLog[]> {
    return db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt));
  }

  async getSecurityLogsByUserId(userId: number): Promise<SecurityLog[]> {
    return db.select().from(securityLogs)
      .where(eq(securityLogs.userId, userId))
      .orderBy(desc(securityLogs.createdAt));
  }

  async getSecurityLogsByEvent(event: string): Promise<SecurityLog[]> {
    return db.select().from(securityLogs)
      .where(eq(securityLogs.event, event))
      .orderBy(desc(securityLogs.createdAt));
  }

  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [securityLog] = await db
      .insert(securityLogs)
      .values(log)
      .returning();
    return securityLog;
  }

  // User Sessions implementation
  async getAllUserSessions(): Promise<UserSession[]> {
    return db.select().from(userSessions).orderBy(desc(userSessions.createdAt));
  }

  async getActiveUserSessions(): Promise<UserSession[]> {
    return db.select().from(userSessions)
      .where(and(
        eq(userSessions.isActive, true),
        gte(userSessions.expiresAt, new Date())
      ))
      .orderBy(desc(userSessions.lastActivity));
  }

  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
    return session || undefined;
  }

  async getUserSessionsByUserId(userId: number): Promise<UserSession[]> {
    return db.select().from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.lastActivity));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [userSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return userSession;
  }

  async updateUserSessionLastActivity(sessionToken: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.sessionToken, sessionToken));
  }

  async deactivateUserSession(sessionToken: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionToken, sessionToken));
  }

  async deactivateAllUserSessions(userId: number): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(lte(userSessions.expiresAt, new Date()));
  }

  // Enhanced User methods implementation
  async updateUserFailedLogin(id: number, increment: boolean = true): Promise<void> {
    if (increment) {
      await db
        .update(users)
        .set({ 
          failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
          lastFailedLogin: new Date()
        })
        .where(eq(users.id, id));
    } else {
      // Reset failed attempts on successful login
      await db
        .update(users)
        .set({ 
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          accountLockedUntil: null
        })
        .where(eq(users.id, id));
    }
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: passwordHash,
        mustChangePassword: false
      })
      .where(eq(users.id, id));
  }

  async lockUserAccount(id: number, lockUntil: Date): Promise<void> {
    await db
      .update(users)
      .set({ accountLockedUntil: lockUntil })
      .where(eq(users.id, id));
  }

  async unlockUserAccount(id: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        accountLockedUntil: null,
        failedLoginAttempts: 0
      })
      .where(eq(users.id, id));
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deactivateUser(id: number): Promise<void> {
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id));
      
    // Also deactivate all user sessions
    await this.deactivateAllUserSessions(id);
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sections: Map<number, Section>;
  private blogPosts: Map<number, BlogPost>;
  private portfolioItems: Map<number, PortfolioItem>;
  private callbackRequests: Map<number, CallbackRequest>;
  private loyaltyProgram: Map<number, LoyaltyProgram>;
  
  private currentUserId: number = 1;
  private currentSectionId: number = 1;
  private currentBlogPostId: number = 1;
  private currentPortfolioItemId: number = 1;
  private currentCallbackRequestId: number = 1;
  private currentLoyaltyProgramId: number = 1;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.blogPosts = new Map();
    this.portfolioItems = new Map();
    this.callbackRequests = new Map();
    this.loyaltyProgram = new Map();

    this.initializeData();
  }

  private initializeData() {
    // Initialize default sections
    const defaultSections = [
      {
        name: 'hero',
        title: 'Создаем магию из цветов',
        description: 'Премиальные цветочные композиции для особенных моментов вашей жизни',
        content: JSON.stringify({
          subtitle: 'Создаем магию из цветов',
          cta: 'Заказать звонок',
          secondaryCta: 'Смотреть портфолио'
        }),
        imageUrl: 'https://pixabay.com/get/g9c9aa5dd75fa205aa9d66a05583dd6c5e413ba8224957480024235f1f4a3c2cc33358cedb4899fae1f5ac8f8cec65086dc046d534347ba47d7a4b263f4fde7b3_1280.jpg',
        isActive: true
      },
      {
        name: 'about',
        title: 'О нас',
        description: 'Более 15 лет мы создаем незабываемые цветочные композиции, воплощая ваши мечты в реальность',
        content: JSON.stringify({
          features: [
            {
              icon: 'fas fa-award',
              title: 'Премиальное качество',
              description: 'Работаем только с лучшими поставщиками, гарантируя свежесть и красоту каждого цветка'
            },
            {
              icon: 'fas fa-heart',
              title: 'Индивидуальный подход',
              description: 'Каждая композиция создается с учетом ваших пожеланий и особенностей события'
            },
            {
              icon: 'fas fa-shipping-fast',
              title: 'Быстрая доставка',
              description: 'Доставляем по всему городу в течение 2 часов с момента заказа'
            }
          ]
        }),
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        isActive: true
      }
    ];

    defaultSections.forEach(section => {
      const id = this.currentSectionId++;
      this.sections.set(id, { ...section, id });
    });

    // Initialize blog posts
    const defaultBlogPosts = [
      {
        title: 'Как правильно обрезать стебли',
        excerpt: 'Правильная обрезка стеблей - залог долгой жизни букета. Узнайте секреты профессионалов.',
        content: 'Правильная обрезка стеблей является ключевым фактором для продления жизни срезанных цветов...',
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
        category: 'Основы ухода',
        isPublished: true,
        createdAt: new Date()
      },
      {
        title: 'Идеальная вода для цветов',
        excerpt: 'Качество воды напрямую влияет на жизнь букета. Рассказываем о правильной подготовке.',
        content: 'Вода является жизненно важным элементом для срезанных цветов...',
        imageUrl: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
        category: 'Секреты свежести',
        isPublished: true,
        createdAt: new Date()
      },
      {
        title: 'Сезонные композиции',
        excerpt: 'Каждое время года дарит уникальные возможности для создания особенных букетов.',
        content: 'Сезонность в флористике играет огромную роль...',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
        category: 'Сезонность',
        isPublished: true,
        createdAt: new Date()
      }
    ];

    defaultBlogPosts.forEach(post => {
      const id = this.currentBlogPostId++;
      this.blogPosts.set(id, { ...post, id });
    });

    // Initialize portfolio items
    const defaultPortfolioItems = [
      {
        title: 'Свадебный букет "Нежность"',
        description: 'Классическая композиция из роз и пионов',
        imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'wedding',
        isActive: true,
        createdAt: new Date()
      },
      {
        title: 'Корпоративная композиция',
        description: 'Стильное оформление офисного пространства',
        imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'corporate',
        isActive: true,
        createdAt: new Date()
      },
      {
        title: 'День рождения "Радость"',
        description: 'Яркая композиция для особого дня',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'birthday',
        isActive: true,
        createdAt: new Date()
      }
    ];

    defaultPortfolioItems.forEach(item => {
      const id = this.currentPortfolioItemId++;
      this.portfolioItems.set(id, { ...item, id });
    });

    // Initialize loyalty program
    const defaultLoyaltyLevels = [
      {
        level: 'beginner',
        title: 'Новичок',
        description: 'Первые покупки от 1000 рублей',
        minAmount: 0,
        maxAmount: 5000,
        discount: 5,
        benefits: JSON.stringify([
          'Скидка 5% на следующий заказ',
          'Бесплатная консультация флориста',
          'SMS-уведомления о скидках'
        ]),
        isActive: true
      },
      {
        level: 'connoisseur',
        title: 'Ценитель',
        description: 'Для постоянных клиентов',
        minAmount: 5000,
        maxAmount: 15000,
        discount: 10,
        benefits: JSON.stringify([
          'Скидка 10% на все заказы',
          'Приоритетная доставка',
          'Персональные предложения',
          'Подарок на день рождения'
        ]),
        isActive: true
      },
      {
        level: 'vip',
        title: 'VIP',
        description: 'Эксклюзивный статус для особых клиентов',
        minAmount: 15000,
        maxAmount: null,
        discount: 15,
        benefits: JSON.stringify([
          'Скидка 15% на все услуги',
          'Бесплатная доставка',
          'Эксклюзивные композиции',
          'Персональный флорист',
          'Приглашения на мастер-классы'
        ]),
        isActive: true
      }
    ];

    defaultLoyaltyLevels.forEach(level => {
      const id = this.currentLoyaltyProgramId++;
      this.loyaltyProgram.set(id, { ...level, id });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'manager',
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  // API Token methods
  async getApiTokenById(id: number): Promise<ApiToken | undefined> {
    // Not implemented in memory storage for simplicity
    return undefined;
  }

  async getApiTokenByHash(tokenHash: string): Promise<ApiToken | undefined> {
    // Not implemented in memory storage for simplicity
    return undefined;
  }

  async getAllApiTokens(): Promise<ApiToken[]> {
    return [];
  }

  async getApiTokensByUserId(userId: number): Promise<ApiToken[]> {
    return [];
  }

  async createApiToken(token: InsertApiToken): Promise<ApiToken> {
    throw new Error('API tokens not implemented in memory storage');
  }

  async updateApiTokenLastUsed(id: number, incrementUsage?: boolean): Promise<void> {
    // Not implemented in memory storage
  }

  async revokeApiToken(id: number, revokedBy: number): Promise<void> {
    // Not implemented in memory storage
  }

  async deactivateApiToken(id: number): Promise<void> {
    // Not implemented in memory storage
  }

  // Section methods
  async getAllSections(): Promise<Section[]> {
    return Array.from(this.sections.values());
  }

  async getSectionByName(name: string): Promise<Section | undefined> {
    return Array.from(this.sections.values()).find(section => section.name === name);
  }

  async updateSection(id: number, sectionData: Partial<InsertSection>): Promise<Section> {
    const existingSection = this.sections.get(id);
    if (!existingSection) {
      throw new Error('Section not found');
    }
    const updatedSection = { ...existingSection, ...sectionData };
    this.sections.set(id, updatedSection);
    return updatedSection;
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const id = this.currentSectionId++;
    const section: Section = { 
      ...insertSection, 
      id,
      content: insertSection.content || null,
      description: insertSection.description || null,
      imageUrl: insertSection.imageUrl || null,
      isActive: insertSection.isActive ?? true 
    };
    this.sections.set(id, section);
    return section;
  }

  // Blog post methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.isPublished)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const blogPost: BlogPost = { 
      ...insertBlogPost, 
      id, 
      createdAt: new Date(),
      excerpt: insertBlogPost.excerpt || null,
      imageUrl: insertBlogPost.imageUrl || null,
      isPublished: insertBlogPost.isPublished ?? false
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      throw new Error('Blog post not found');
    }
    const updatedPost = { ...existingPost, ...postData };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  // Portfolio item methods
  async getAllPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getActivePortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values())
      .filter(item => item.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPortfolioItemsByCategory(category: string): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values())
      .filter(item => item.category === category && item.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }

  async createPortfolioItem(insertPortfolioItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.currentPortfolioItemId++;
    const portfolioItem: PortfolioItem = { 
      ...insertPortfolioItem, 
      id, 
      createdAt: new Date(),
      description: insertPortfolioItem.description || null,
      imageUrl: insertPortfolioItem.imageUrl || null,
      isActive: insertPortfolioItem.isActive ?? true
    };
    this.portfolioItems.set(id, portfolioItem);
    return portfolioItem;
  }

  async updatePortfolioItem(id: number, itemData: Partial<InsertPortfolioItem>): Promise<PortfolioItem> {
    const existingItem = this.portfolioItems.get(id);
    if (!existingItem) {
      throw new Error('Portfolio item not found');
    }
    const updatedItem = { ...existingItem, ...itemData };
    this.portfolioItems.set(id, updatedItem);
    return updatedItem;
  }

  async deletePortfolioItem(id: number): Promise<void> {
    this.portfolioItems.delete(id);
  }

  // Callback request methods
  async getAllCallbackRequests(): Promise<CallbackRequest[]> {
    return Array.from(this.callbackRequests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCallbackRequest(id: number): Promise<CallbackRequest | undefined> {
    return this.callbackRequests.get(id);
  }

  async createCallbackRequest(insertCallbackRequest: InsertCallbackRequest): Promise<CallbackRequest> {
    const id = this.currentCallbackRequestId++;
    const callbackRequest: CallbackRequest = { 
      ...insertCallbackRequest, 
      id, 
      status: 'pending',
      createdAt: new Date(),
      message: insertCallbackRequest.message || null,
      callTime: insertCallbackRequest.callTime || null
    };
    this.callbackRequests.set(id, callbackRequest);
    return callbackRequest;
  }

  async updateCallbackRequestStatus(id: number, status: string): Promise<CallbackRequest> {
    const existingRequest = this.callbackRequests.get(id);
    if (!existingRequest) {
      throw new Error('Callback request not found');
    }
    const updatedRequest = { ...existingRequest, status };
    this.callbackRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteCallbackRequest(id: number): Promise<void> {
    this.callbackRequests.delete(id);
  }

  // Loyalty program methods
  async getAllLoyaltyLevels(): Promise<LoyaltyProgram[]> {
    return Array.from(this.loyaltyProgram.values()).sort((a, b) => a.minAmount - b.minAmount);
  }

  async getActiveLoyaltyLevels(): Promise<LoyaltyProgram[]> {
    return Array.from(this.loyaltyProgram.values())
      .filter(level => level.isActive)
      .sort((a, b) => a.minAmount - b.minAmount);
  }

  async getLoyaltyLevel(id: number): Promise<LoyaltyProgram | undefined> {
    return this.loyaltyProgram.get(id);
  }

  async updateLoyaltyLevel(id: number, levelData: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram> {
    const existingLevel = this.loyaltyProgram.get(id);
    if (!existingLevel) {
      throw new Error('Loyalty level not found');
    }
    const updatedLevel = { ...existingLevel, ...levelData };
    this.loyaltyProgram.set(id, updatedLevel);
    return updatedLevel;
  }

  async createLoyaltyLevel(insertLoyaltyProgram: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const id = this.currentLoyaltyProgramId++;
    const loyaltyLevel: LoyaltyProgram = { 
      ...insertLoyaltyProgram, 
      id, 
      description: insertLoyaltyProgram.description || null,
      benefits: insertLoyaltyProgram.benefits || null,
      maxAmount: insertLoyaltyProgram.maxAmount || null,
      isActive: insertLoyaltyProgram.isActive ?? true
    };
    this.loyaltyProgram.set(id, loyaltyLevel);
    return loyaltyLevel;
  }

  async deleteLoyaltyLevel(id: number): Promise<void> {
    this.loyaltyProgram.delete(id);
  }

  // Callback request update method
  async updateCallbackRequest(id: number, data: Partial<InsertCallbackRequest>): Promise<CallbackRequest> {
    const existingRequest = this.callbackRequests.get(id);
    if (!existingRequest) {
      throw new Error('Callback request not found');
    }
    const updatedRequest = { ...existingRequest, ...data };
    this.callbackRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Image methods (stub implementation for MemStorage)
  async getAllImages(): Promise<Image[]> {
    return [];
  }

  async getImagesByCategory(category: string): Promise<Image[]> {
    return [];
  }

  async getActiveImages(): Promise<Image[]> {
    return [];
  }

  async getImage(id: number): Promise<Image | undefined> {
    return undefined;
  }

  async getImageByFilename(filename: string): Promise<Image | undefined> {
    return undefined;
  }

  async createImage(image: InsertImage): Promise<Image> {
    throw new Error('Not implemented in memory storage');
  }

  async updateImage(id: number, image: Partial<InsertImage>): Promise<Image> {
    throw new Error('Not implemented in memory storage');
  }

  async deleteImage(id: number): Promise<void> {
    // Not implemented in memory storage
  }

  // Customers (not implemented in MemStorage)
  async getAllCustomers(): Promise<Customer[]> {
    throw new Error("MemStorage doesn't support customer operations");
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    throw new Error("MemStorage doesn't support customer operations");
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    throw new Error("MemStorage doesn't support customer operations");
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    throw new Error("MemStorage doesn't support customer operations");
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    throw new Error("MemStorage doesn't support customer operations");
  }

  async deleteCustomer(id: number): Promise<void> {
    throw new Error("MemStorage doesn't support customer operations");
  }

  // Sales CRM (not implemented in MemStorage)
  async getAllSales(): Promise<Sale[]> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  async getSale(id: number): Promise<Sale | undefined> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  async deleteSale(id: number): Promise<void> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  async getSalesStats(): Promise<{ totalSales: number, totalRevenue: number, avgOrderValue: number }> {
    throw new Error("MemStorage doesn't support sales operations");
  }

  // Settings (not implemented in MemStorage)
  async getAllSettings(): Promise<Setting[]> {
    throw new Error("MemStorage doesn't support settings operations");
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    throw new Error("MemStorage doesn't support settings operations");
  }

  async setSetting(key: string, value: string, description?: string): Promise<Setting> {
    throw new Error("MemStorage doesn't support settings operations");
  }

  async updateSetting(id: number, setting: Partial<InsertSetting>): Promise<Setting> {
    throw new Error("MemStorage doesn't support settings operations");
  }

  async deleteSetting(id: number): Promise<void> {
    throw new Error("MemStorage doesn't support settings operations");
  }
}

export const storage = new DatabaseStorage();
