# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
ENV CI=true

# Instala dependencias (copia package-lock si usas npm)
COPY package*.json ./
RUN npm ci

# Copia el resto y build
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Puerto por defecto usado por Cloud Run
ENV PORT=8080

# Copy build + deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 8080
# start con puerto configurable (usa NEXT/Start script)
CMD ["sh", "-c", "npm run start -- -p ${PORT:-8080}"]