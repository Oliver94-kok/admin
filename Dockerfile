# Base image  
FROM node:18-alpine AS base  

# Install dependencies only when needed  
FROM base AS deps  
RUN apk add --no-cache libc6-compat  
WORKDIR /app  
COPY package.json package-lock.json* ./  
RUN npm ci  

# Builder stage  
FROM base AS builder  
WORKDIR /app  
COPY --from=deps /app/node_modules ./node_modules  
COPY . .  
RUN npx prisma generate  
ENV NEXT_TELEMETRY_DISABLED=1   
RUN npm run build  
RUN ls -la .next  

# Production image  
FROM base AS runner  
WORKDIR /app  
ENV NODE_ENV=production  
ENV NEXT_TELEMETRY_DISABLED=1  

RUN addgroup --system --gid 1001 nodejs  
RUN adduser --system --uid 1001 nextjs  

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads && \
    chown -R nextjs:nodejs /app/public && \
    chmod -R 777 /app/public/uploads

COPY --from=builder /app/public ./public  
RUN mkdir .next  
RUN chown nextjs:nodejs .next  
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./  
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static  

USER nextjs  
EXPOSE 3000  
ENV PORT=3000  
ENV HOSTNAME="0.0.0.0"   

# Add environment variables if needed


CMD ["node", "server.js"]