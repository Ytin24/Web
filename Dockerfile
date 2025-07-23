# --- Stage 1: Build frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY client ./client
COPY shared ./shared
COPY vite.config.ts ./vite.config.ts
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.js ./postcss.config.js
RUN npm run build

# --- Stage 2: Build backend ---
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# Копируем собранный фронт из предыдущего этапа
COPY --from=frontend-build /app/dist/public ./dist/public
RUN npm run build

# --- Stage 3: Production image ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/package.json ./
COPY --from=backend-build /app/package-lock.json ./
COPY --from=backend-build /app/.env ./
COPY --from=backend-build /app/shared ./shared
COPY --from=backend-build /app/server ./server
COPY --from=backend-build /app/attached_assets ./attached_assets
COPY --from=backend-build /app/migrations ./migrations
RUN npm ci --omit=dev --legacy-peer-deps
EXPOSE 5000
CMD ["node", "dist/index.js"]