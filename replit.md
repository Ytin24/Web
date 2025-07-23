# Цветокрафт - Flower Shop Website

## Overview

Цветокрафт is a modern, multilingual flower shop website built with a full-stack architecture featuring React on the frontend, Express.js on the backend, and PostgreSQL database. The application serves as both a customer-facing website and an administrative content management system for a Russian flower shop business.

## User Preferences

**Communication Style**: Simple, everyday language. Запоминать все нюансы чтобы при добавлении функционала не терялся и не выбивался из стиля сайта.

**Development Style Preferences**:
- Maintain consistent visual aesthetics across all components
- Follow established patterns for glass morphism and natural floral design
- Use semantic color tokens (`text-foreground`, `text-muted-foreground`) instead of hardcoded colors
- Implement responsive design with mobile-first approach
- Add proper TypeScript typing and error handling
- Keep animations smooth but performance-optimized

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
- **Products**: Complete product catalog with categories, pricing, and inventory
- **Customers & CRM**: Customer relationship management with sales tracking
- **Color Schemes**: Site-wide color customization with live preview system

### User Interface Components
- **Glass Morphism Design**: Modern glass-effect styling throughout the application with natural aesthetics
- **Responsive Layout**: Mobile-first design optimized for iPhone 13 Pro and all screen sizes
- **Animation System**: Custom scroll-reveal animations, floating elements, and Framer Motion integration
- **Component Library**: Comprehensive UI component system based on Radix primitives
- **Color System**: Dynamic CSS custom properties with three predefined color schemes
- **Theme Support**: Light/dark theme with semantic color tokens and accessibility compliance
- **Performance Optimization**: Device-specific optimizations with reduced animations on mobile

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
- **Tailwind CSS**: Utility-first CSS framework with custom CSS variables for dynamic theming
- **Lucide React**: Icon system for consistent visual elements
- **class-variance-authority**: Type-safe styling variants and component composition
- **Framer Motion**: Advanced animation library for smooth, performant interactions

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
- **Performance**: Serverless database, optimized builds, device-specific optimizations
- **Scalability**: Component-based architecture allows for easy feature expansion
- **Maintainability**: Shared schemas, utilities, and centralized color management
- **User Experience**: Modern UI patterns with smooth animations, responsive design, and accessibility
- **Customization**: Dynamic color schemes with real-time preview and admin control
- **Mobile Optimization**: Performance-aware animations and responsive design patterns

The application is designed for easy deployment on platforms like Replit while maintaining production-ready architecture patterns for potential scaling to dedicated hosting environments.

## Recent Changes

### AI-Powered Chatbot "Флора" Implementation (2025-01-22)
- Integrated DeepSeek API for intelligent flower recommendations and consultations
- Created personalized chatbot character "Флора" with clear boundaries and professional guidelines
- Implemented smart conversation flow: consultation → recommendation → order direction
- Added beautiful pink-to-purple gradient design theme for chatbot interface
- Configured fallback responses when API is unavailable
- Added sentiment analysis for customer feedback monitoring
- Enhanced Flora chatbot with built-in flower recommendation system and quick command buttons
- Removed separate /flower-ai page and integrated all AI florist functionality into Flora chat
- Updated navigation by removing redundant AI Florist link
- Added proper error handling and JSON parsing for API responses
- Added Markdown support for beautifully formatted chat responses (react-markdown + remark-gfm)
- Added quick suggestion buttons for common flower requests (букет для мамы, романтический, свадебный)

## Recent Changes

### Admin Panel Improvement - Products Management & AI Integration (2025-01-22)
- Replaced redundant "Секции" management with comprehensive "Управление товарами" (Products Management)
- Added complete product catalog with categories, search, and filtering functionality
- Integrated product statistics dashboard (total products, active products, average price)
- Created CRUD operations for product management with form validation
- Added product categories: букеты, растения, композиции, свадебные, траурные, корпоративные
- **Moved "Быстрый пост" functionality to "Профессор Ботаникус" in content editor**
- Enhanced content editor with comprehensive AI assistant interface
- Added quick action buttons for common AI tasks (improve title, write intro, add conclusion)
- Integrated AI response insertion directly into article content
- Enhanced admin interface organization and usability

### Complete UI Redesign - Natural Floral Aesthetics (2025-01-22)
- Migrated from Apple-style design to harmonious, natural floral aesthetics
- Implemented natural color palette: soft greens, whites, creams for better visual harmony
- Replaced Apple animations (AppleCard, AppleText, AppleButton) with clean, minimal components
- Added natural-card and natural-hover classes for subtle, elegant interactions
- Enhanced typography with better line-height and letter-spacing for readability
- Improved section spacing and white space for cleaner, more breathable design
- Updated all primary components: hero, about, blog sections with consistent styling
- Maintained chat functionality while updating design to match new aesthetic

### Enhanced Modal System and Navigation (2025-01-22)
- Added individual blog post pages with SEO-friendly URLs (/blog/:id) for shareable links
- Replaced blog post modal with navigation to dedicated blog pages with proper meta tags
- Enhanced image modal with better accessibility (DialogTitle and DialogDescription)
- Made all blog and portfolio images clickable with full-screen preview functionality
- Improved visual design with better image hover effects and maximize buttons

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

### Playful Floating Tooltips with Personality Implementation (2025-01-23)
- Created comprehensive tooltip system with five distinct personalities (cheerful, wise, excited, caring, mysterious)
- Added dynamic tooltip messages that change based on hover duration for enhanced user engagement
- Implemented stable tooltip hooks with proper state management to prevent infinite re-renders
- Created demonstration page at /tooltips-demo showcasing all tooltip personalities and features
- Enhanced user experience with floating tooltips that add character and charm to navigation elements
- Added proper CSS theming support for tooltips with personality-specific colors and animations

### Text Contrast and Theme Accessibility Improvements (2025-01-23)
- Fixed all white text appearing on light theme by replacing with proper semantic color tokens
- Replaced hardcoded `text-white` classes with theme-aware `text-foreground` and `text-muted-foreground`
- Updated footer navigation links to use proper contrast colors for both light and dark themes
- Enhanced gradient text visibility in dark theme with brighter color values
- Fixed playful tooltip text contrast using semantic foreground colors
- Updated button variants to use theme-appropriate text colors instead of hardcoded white
- Improved overall accessibility and readability across all theme modes

### Mobile Responsiveness Optimization for iPhone 13 Pro (2025-01-23)
- Implemented comprehensive responsive design system using Tailwind CSS breakpoints (sm:, md:, lg:)
- Optimized navigation bar with mobile-specific sizing and spacing adjustments
- Enhanced hero section with responsive text sizes, padding, and button layouts
- Updated all section components (About, Blog, Portfolio, Contact, Loyalty) for mobile compatibility
- Optimized chat button positioning and sizing for mobile devices (smaller screens)
- Improved footer layout with responsive grid system and mobile-appropriate spacing
- Added mobile-specific padding and margin adjustments throughout the application
- Enhanced typography scaling across different screen sizes for optimal readability
- Implemented responsive image sizing and grid layouts for better mobile experience
- Fixed element overlapping issues on smaller screens through proper spacing and sizing

### UI/UX Improvements and Bug Fixes (2025-01-23)
- Removed distracting floating circles from loyalty section for cleaner visual design
- Fixed chatbot scroll-through issue by implementing proper z-index layering and body scroll lock
- Enhanced chatbot interaction by preventing page scrolling when chat interface is active
- Improved overall user experience with better visual hierarchy and interaction patterns

### Chat Interface Enhancement (2025-01-23)
- Expanded chat interface dimensions from 400x500px to 480x600px for desktop
- Increased mobile chat height from 70vh to 80vh for better message visibility
- Enhanced chat header with informative status ("AI-флорист • Онлайн • Готова помочь")
- Improved message spacing and padding for better readability
- Redesigned quick suggestions with better mobile layout and descriptions

### Mobile Responsiveness Fix (2025-01-23)
- Fixed "дополнительные преимущества" section layout for mobile devices
- Added proper responsive padding (p-6 sm:p-8 md:p-12) for different screen sizes
- Implemented responsive grid layout with proper ordering for mobile (order-1/order-2)
- Adjusted icon sizes, text sizes, and spacing for mobile compatibility
- Enhanced button responsiveness with full-width on mobile, auto-width on desktop

### Chat Suggestions Enhancement (2025-01-23)
- Added toggle functionality for quick suggestions with hide/show button
- Implemented state management for suggestion visibility (showSuggestions)
- Added close button (X) in suggestions header for better UX
- Created "Показать быстрые предложения" button when suggestions are hidden
- Enhanced user control over chat interface elements for cleaner experience

### Loyalty Program Button Fix (2025-01-23)
- Fixed loyalty program button overflow on mobile devices
- Added proper responsive sizing with max-width constraints (max-w-xs sm:max-w-sm)
- Implemented text truncation to prevent button content overflow
- Added shrink-0 to icon to prevent icon compression
- Enhanced button layout with centered positioning for better mobile display

### Performance Optimization for Mobile Devices (2025-01-23)
- Created comprehensive device detection system (useDeviceDetection hook) with mobile/tablet/desktop identification
- Implemented performance optimization hooks (usePerformanceOptimization) for resource management
- Optimized ParallaxContainer with requestAnimationFrame throttling and mobile disabling
- Enhanced ScrollReveal with adaptive thresholds and reduced motion support
- Optimized FloatingElements to disable completely on mobile devices for battery saving
- Added CSS media queries for mobile-specific optimizations:
  - Reduced backdrop-filter blur from 12px to 6px on tablets, disabled on phones
  - Disabled heavy animations (float, bloom, parallax, pulse-glow) on weak devices
  - Optimized scroll-animate transitions: faster duration (0.6s) and smaller transforms (30px) on mobile
  - Added prefers-reduced-motion support throughout the application
- Enhanced PhoneInput component with mobile-optimized text sizing and autocomplete
- Integrated performance optimization system into main App component
- Created utility functions for debouncing and throttling heavy operations

### Services Management System Implementation (2025-01-23)
- Created comprehensive services management system with full CRUD operations
- Added services database schema with flexible fields: name, description, pricing, duration, categories
- Implemented API routes for services with proper authentication and validation
- Built admin interface for services management with form validation and category organization
- Added services categories: букеты, оформление, мероприятия, доставка, консультации, уход за растениями
- Integrated services management tab in admin panel with create, edit, delete functionality
- Services support features lists, popularity flags, active/inactive status, and custom sorting
- Enhanced admin panel organization with logical service management placement
- Removed Flora chat button from admin panel to keep it only on main website pages

### Enhanced AI Chat Interface with Dynamic Animations (2025-01-23)
- Redesigned chat button with dynamic pulsing rings, floating sparkles, and animated flower icon
- Added beautiful glassmorphic tooltip with animated background gradient and floating particles
- Enhanced chat interface with Framer Motion spring animations for smooth appearance/exit
- Created animated background with floating particles and decorative corner gradients
- Improved chat header with animated avatar, pulsing online status, and gradient text effects
- Updated all hover states with proper contrast: lighter colors on light theme, brighter on dark theme
- Added enhanced button animations with scale effects and rotation on interaction
- Optimized focus states for accessibility with pink/purple color scheme throughout interface

### Unified Color Palette System & Admin Customization (2025-01-23)
- Created comprehensive unified color palette system with three predefined schemes:
  - **floralPink**: Soft pink-to-purple gradients with warm undertones (default)
  - **botanicalGreen**: Natural green palette with earth tones and botanical feel
  - **royalPurple**: Rich purple scheme with luxury aesthetic and deep contrast
- Implemented complete database schema for color scheme settings with proper relationships
- Built full-stack color scheme management: database storage, API routes, admin interface
- Added admin color scheme management tab with live preview and real-time switching
- Integrated color scheme provider with React context for efficient state management
- Color schemes dynamically update CSS custom properties throughout entire application
- Each scheme includes complete color definitions: primary, secondary, accent, background variants
- Admin can preview schemes before applying with instant visual feedback
- System automatically loads and applies saved color scheme on application startup
- Enhanced admin panel with dedicated "Цвета" tab for comprehensive color customization

### Comprehensive Webhook Notification System Implementation (2025-01-23)
- Built complete webhook notification system for real-time tracking of website changes and events
- Created database schema with webhooks and webhook deliveries tables for comprehensive logging
- Implemented WebhookService class with event triggering, delivery tracking, and retry mechanisms
- Added webhook management API routes with full CRUD operations, authentication, and validation
- Integrated webhook events into existing routes: callback requests, blog posts, sales, and customer actions
- Built comprehensive admin interface for webhook management with event subscription and monitoring
- Added webhook statistics dashboard showing delivery success rates, failure counts, and recent activity
- Implemented webhook signature verification using HMAC-SHA256 for secure payload authentication
- Created webhook testing functionality with URL validation and test payload delivery
- Added support for multiple event types: callbacks, blog posts, sales, customers, products, portfolio items
- Included webhook delivery logging with response status tracking and error handling
- Created webhook test documentation with examples for PHP, Python, and n8n integrations
- Enhanced admin panel with dedicated "Webhook'и" tab for complete webhook lifecycle management
- Implemented automatic webhook triggering on all major business events for external system integration

## Design System Guidelines

### Visual Design Patterns
- **Glass Morphism**: All cards use `glass-effect` class with backdrop blur and subtle borders
- **Natural Aesthetics**: Soft, organic color transitions with botanical-inspired naming
- **Consistent Spacing**: Use padding classes (p-4, p-6, p-8) and margin utilities consistently
- **Typography**: Gradient text for headings (`gradient-text` class), semantic foreground colors
- **Hover States**: Light theme uses lighter colors, dark theme uses brighter contrasting colors

### Component Architecture
- **Shared Components**: Located in `client/src/components/` with proper TypeScript exports
- **Admin Components**: Separate folder `client/src/components/admin/` for admin-specific UI
- **Icon Usage**: Lucide React icons with consistent sizing (w-4 h-4, w-5 h-5, w-6 h-6)
- **Form Patterns**: React Hook Form + Zod validation + shadcn/ui form components
- **State Management**: TanStack Query for server state, React useState for local UI state

### Color System Implementation
- **CSS Variables**: All colors defined as CSS custom properties in `:root` and `.dark`
- **Semantic Tokens**: Use `text-foreground`, `bg-background`, `border-border` instead of hardcoded
- **Theme Support**: Components automatically adapt to light/dark themes
- **Color Schemes**: Three predefined schemes with complete color definitions and descriptions

### Animation and Performance
- **Mobile Optimization**: Reduced animations on mobile devices using `useDeviceDetection`
- **Framer Motion**: Spring animations for modals and interactive elements
- **CSS Transitions**: Subtle hover effects with consistent timing (transition-all duration-200)
- **Performance Hooks**: `usePerformanceOptimization` for device-specific optimizations

### Database and API Patterns
- **Schema Design**: Drizzle ORM with shared types between frontend and backend
- **API Routes**: RESTful endpoints with proper error handling and TypeScript validation
- **Authentication**: JWT tokens with role-based access control for admin features
- **Data Fetching**: TanStack Query with proper cache invalidation and loading states