# Цветокрафт - Flower Shop Website

## Overview

Цветокрафт is a modern, multilingual flower shop website built with a full-stack architecture featuring React on the frontend, Express.js on the backend, and PostgreSQL database. The application serves as both a customer-facing website and an administrative content management system for a Russian flower shop business.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Middleware**: Express middleware for logging, error handling, and request parsing
- **Development**: Hot reloading with Vite middleware integration

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Connection**: @neondatabase/serverless for optimized serverless connections
- **Storage Layer**: DatabaseStorage class implementing persistent data storage (migrated from in-memory MemStorage on 2025-01-22)

## Key Components

### Content Management System
The application features a comprehensive admin panel that allows management of:
- **Sections**: Dynamic content sections (hero, about, loyalty program)
- **Blog Posts**: Article management with categories and publishing status
- **Portfolio Items**: Gallery management with categorization
- **Callback Requests**: Customer inquiry management with status tracking
- **Loyalty Programs**: Multi-tier customer loyalty system management

### User Interface Components
- **Glass Morphism Design**: Modern glass-effect styling throughout the application
- **Responsive Layout**: Mobile-first design with adaptive components
- **Animation System**: Custom scroll-reveal animations and floating elements
- **Component Library**: Comprehensive UI component system based on Radix primitives

### Business Logic
- **Multi-language Support**: Russian language interface for the target market
- **Customer Engagement**: Callback request system for customer inquiries
- **Portfolio Showcase**: Categorized gallery system for different event types
- **Content Publishing**: Draft/publish workflow for blog content

## Data Flow

### Frontend to Backend Communication
1. React components use TanStack Query for API calls
2. API requests are made through a centralized `apiRequest` utility
3. Type-safe data validation using Zod schemas
4. Optimistic updates and caching through React Query

### Database Operations
1. Drizzle ORM provides type-safe database queries
2. Shared schema definitions ensure consistency between frontend and backend
3. Database migrations managed through Drizzle Kit
4. Connection pooling handled by Neon serverless driver

### Content Management Flow
1. Admin interface allows CRUD operations on all content types
2. Form validation using Zod schemas shared between client and server
3. Real-time updates through React Query cache invalidation
4. Status management for publishable content (blog posts, portfolio items)

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide React**: Icon system for consistent visual elements
- **class-variance-authority**: Type-safe styling variants

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with HMR
- **Type Checking**: Continuous TypeScript compilation
- **Database**: Direct connection to Neon PostgreSQL instance
- **Environment Variables**: Database URL and development flags

### Production Build
1. **Frontend Build**: Vite builds React application to static assets
2. **Backend Build**: ESBuild bundles Express server for Node.js runtime
3. **Database Setup**: Drizzle migrations applied to production database
4. **Asset Serving**: Express serves built frontend assets in production

### Architecture Benefits
- **Type Safety**: End-to-end TypeScript ensures runtime reliability
- **Performance**: Serverless database and optimized builds for fast loading
- **Scalability**: Component-based architecture allows for easy feature expansion
- **Maintainability**: Shared schemas and utilities reduce code duplication
- **User Experience**: Modern UI patterns with smooth animations and responsive design

The application is designed for easy deployment on platforms like Replit while maintaining production-ready architecture patterns for potential scaling to dedicated hosting environments.

## Recent Changes

### AI-Powered Chatbot "Флора" Implementation (2025-01-22)
- Integrated DeepSeek API for intelligent flower recommendations and consultations
- Created personalized chatbot character "Флора" with clear boundaries and professional guidelines
- Implemented smart conversation flow: consultation → recommendation → order direction
- Added beautiful pink-to-purple gradient design theme for chatbot interface
- Configured fallback responses when API is unavailable
- Added sentiment analysis for customer feedback monitoring
- Created dedicated /flower-ai page with advanced recommendation system
- Updated navigation to include AI Florist section
- Added proper error handling and JSON parsing for API responses

## Recent Changes

### Enhanced Modal System and Navigation (2025-01-22)
- Added individual blog post pages with SEO-friendly URLs (/blog/:id) for shareable links
- Replaced blog post modal with navigation to dedicated blog pages with proper meta tags
- Enhanced image modal with better accessibility (DialogTitle and DialogDescription)
- Made all blog and portfolio images clickable with full-screen preview functionality
- Improved visual design with better image hover effects and maximize buttons

### Improved Glass Morphism Design (2025-01-22)
- Enhanced glass effect cards with better contrast and readability
- Updated blog cards with white/80 background for better content visibility
- Improved portfolio cards with enhanced overlay effects and better text contrast
- Added drop shadows and improved typography for better text legibility
- Replaced traditional glass effects with more opaque backgrounds for content clarity

### Database Migration (2025-01-22)
- Successfully migrated from in-memory MemStorage to persistent PostgreSQL database
- Implemented DatabaseStorage class with full CRUD operations for all entities
- Database schema created using Drizzle Kit push command
- All existing data preserved during migration process
- Application now uses persistent data storage with proper database connection pooling

### Dynamic Image Management (2025-01-22)
- Replaced all hardcoded image URLs with database-driven dynamic image system
- Added images table to database schema for comprehensive image metadata management
- Implemented SVG image generation API serving category-specific, themed graphics
- Created dynamic image routes (/api/images) for programmatic image management
- All sections, blog posts, and portfolio items now use database-referenced dynamic images
- Images are categorized (hero, about, portfolio, blog, general) with proper theming and alt text