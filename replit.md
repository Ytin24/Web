# Цветокрафт - Сайт Цветочного Магазина

## Обзор Проекта

Цветокрафт - современный многофункциональный веб-сайт цветочного магазина, построенный на полностековой архитектуре с React на фронтенде, Express.js на бэкенде и базой данных PostgreSQL. Приложение служит как клиентским веб-сайтом, так и административной системой управления контентом для российского цветочного бизнеса.

## Предпочтения Пользователя

**Стиль Общения**: Простой, повседневный язык. Запоминать все нюансы чтобы при добавлении функционала не терялся и не выбивался из стиля сайта. Вести всю техническую документацию на русском языке.

**Предпочтения по Разработке**:
- Поддерживать согласованную визуальную эстетику во всех компонентах
- Следовать установленным паттернам для стеклянного морфизма и естественного флористического дизайна
- Использовать семантические цветовые токены (`text-foreground`, `text-muted-foreground`) вместо жестко заданных цветов
- Реализовывать адаптивный дизайн с подходом mobile-first
- Добавлять правильную типизацию TypeScript и обработку ошибок
- Сохранять плавные анимации, но оптимизированные по производительности

## Системная Архитектура

### Архитектура Фронтенда
- **Фреймворк**: React с TypeScript
- **Инструмент Сборки**: Vite для разработки и производственных сборок
- **UI Библиотека**: Компоненты Radix UI с системой стилей shadcn/ui
- **Стилизация**: Tailwind CSS с пользовательскими CSS переменными для тем
- **Управление Состоянием**: TanStack Query (React Query) для управления состоянием сервера
- **Маршрутизация**: Wouter для легковесной клиентской маршрутизации
- **Формы**: React Hook Form с валидацией Zod

### Архитектура Бэкенда
- **Среда Выполнения**: Node.js с фреймворком Express.js
- **Язык**: TypeScript с ES модулями
- **Стиль API**: RESTful API с JSON ответами
- **Middleware**: Express middleware для логирования, обработки ошибок и парсинга запросов
- **Разработка**: Горячая перезагрузка с интеграцией Vite middleware

### Архитектура Базы Данных
- **База Данных**: PostgreSQL с хостингом Neon serverless
- **ORM**: Drizzle ORM для типобезопасных операций с базой данных
- **Управление Схемой**: Drizzle Kit для миграций и обновлений схемы
- **Подключение**: @neondatabase/serverless для оптимизированных serverless подключений
- **Слой Хранения**: Класс DatabaseStorage, реализующий постоянное хранение данных (мигрирован с in-memory MemStorage 22.01.2025)

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

## Последние Изменения

### Реализация ИИ-Чатбота "Флора" (22.01.2025)
- Интегрирован DeepSeek API для интеллектуальных рекомендаций цветов и консультаций
- Создан персонализированный персонаж чатбота "Флора" с четкими границами и профессиональными руководящими принципами
- Реализован умный поток диалога: консультация → рекомендация → направление на заказ
- Добавлена красивая розово-фиолетовая градиентная тема дизайна для интерфейса чатбота
- Настроены резервные ответы при недоступности API
- Добавлен анализ настроений для мониторинга отзывов клиентов
- Улучшен чатбот Флора с встроенной системой рекомендаций цветов и кнопками быстрых команд
- Удалена отдельная страница /flower-ai и интегрирован весь функционал ИИ-флориста в чат Флоры
- Обновлена навигация с удалением избыточной ссылки ИИ Флорист
- Добавлена правильная обработка ошибок и парсинг JSON для ответов API
- Добавлена поддержка Markdown для красиво отформатированных ответов чата (react-markdown + remark-gfm)
- Добавлены кнопки быстрых предложений для популярных запросов цветов (букет для мамы, романтический, свадебный)

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

### Комплексная Реализация Системы Webhook Уведомлений (23.01.2025)
- Построена полная система webhook уведомлений для отслеживания изменений и событий сайта в режиме реального времени
- Создана схема базы данных с таблицами webhook'ов и доставок webhook'ов для комплексного логирования
- Реализован класс WebhookService с запуском событий, отслеживанием доставки и механизмами повторных попыток
- Добавлены API маршруты управления webhook'ами с полными CRUD операциями, аутентификацией и валидацией
- Интегрированы webhook события в существующие маршруты: заявки на звонок, статьи блога, продажи и действия клиентов
- Построен комплексный админ интерфейс для управления webhook'ами с подпиской на события и мониторингом
- Добавлена панель статистики webhook'ов с показом коэффициентов успешности доставки, количества ошибок и недавней активности
- Реализована проверка подписи webhook'ов с использованием HMAC-SHA256 для безопасной аутентификации payload
- Создан функционал тестирования webhook'ов с валидацией URL и доставкой тестовых payload
- Добавлена поддержка множественных типов событий: заявки, статьи блога, продажи, клиенты, товары, элементы портфолио
- Включено логирование доставки webhook'ов с отслеживанием статуса ответа и обработкой ошибок
- Создана тестовая документация webhook'ов с примерами для интеграций PHP, Python и n8n
- Улучшена админ панель с выделенной вкладкой "Webhook'и" для полного управления жизненным циклом webhook'ов
- Реализован автоматический запуск webhook'ов на все основные бизнес события для интеграции с внешними системами

### Полная Русификация Технической Документации (23.01.2025)
- Переведена вся техническая документация проекта на русский язык в соответствии с предпочтениями пользователя
- Русифицированы комментарии в коде серверной части (webhook-service.ts, webhook-routes.ts, routes.ts)
- Создана полная русская документация по webhook'ам (WEBHOOK-ДОКУМЕНТАЦИЯ.md) с примерами интеграции
- Обновлен файл replit.md с русскими заголовками и описаниями архитектуры
- Переведены пользовательские предпочтения и руководящие принципы разработки
- Русифицированы все недавние изменения и описания функционала
- Создана документация с примерами кода для PHP, Python, Node.js и интеграций с внешними системами
- Добавлены инструкции по безопасности, тестированию и устранению неисправностей на русском языке