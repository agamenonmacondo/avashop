# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

# Build-time args (only public NEXT_PUBLIC_* keys if needed at build time)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# export as env so next build sees them (public vars only)
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Install deps first (copy package files only)
COPY package*.json ./
RUN npm ci

# Copy source and build (source must be present before build)
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app; Next.js standalone output will include server.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

# Cloud Build configuration
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/ava-shop:$SHORT_SHA'
      - '--build-arg'
      - 'NEXT_PUBLIC_FIREBASE_API_KEY=$$NEXT_PUBLIC_FIREBASE_API_KEY'
      - '--build-arg'
      - 'NEXT_PUBLIC_SUPABASE_URL=$$NEXT_PUBLIC_SUPABASE_URL'
      - '--build-arg'
      - 'NEXT_PUBLIC_SUPABASE_ANON_KEY=$$NEXT_PUBLIC_SUPABASE_ANON_KEY'
      - '.'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/ava-shop:$SHORT_SHA'

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        # deploy with runtime env and attach secret from Secret Manager (recommended)
        gcloud run deploy $_SERVICE \
          --image gcr.io/$PROJECT_ID/ava-shop:$SHORT_SHA \
          --region $_REGION \
          --platform managed \
          --allow-unauthenticated \
          --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_SUPABASE_URL=$_NEXT_PUBLIC_SUPABASE_URL" \
          --set-secrets "SUPABASE_SERVICE_ROLE_KEY=projects/$PROJECT_ID/secrets/SUPABASE_SERVICE_ROLE_KEY:latest" \
          --project $PROJECT_ID

secrets:
  - secretEnv:
      NEXT_PUBLIC_FIREBASE_API_KEY: "projects/PROJECT_ID/secrets/NEXT_PUBLIC_FIREBASE_API_KEY/versions/latest"
      NEXT_PUBLIC_SUPABASE_URL: "projects/PROJECT_ID/secrets/NEXT_PUBLIC_SUPABASE_URL/versions/latest"
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "projects/PROJECT_ID/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY/versions/latest"
      SUPABASE_SERVICE_ROLE_KEY: "projects/PROJECT_ID/secrets/SUPABASE_SERVICE_ROLE_KEY/versions/latest"

substitutions:
  _IMAGE: 'ava-shop'
  _SERVICE: 'ava-shop'
  _REGION: 'europe-west1'
  _NEXT_PUBLIC_SUPABASE_URL: ""
  _FIREBASE_API_KEY: ""
  _SUPABASE_SERVICE_ROLE_KEY: ""
