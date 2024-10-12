# Base image  
FROM node:18-alpine AS base  

# Install dependencies only when needed  
FROM base AS deps  
RUN apk add --no-cache libc6-compat  
WORKDIR /app  

# Copy package files  
COPY package.json package-lock.json* ./  
RUN npm ci  

# Builder stage  
FROM base AS builder  
WORKDIR /app  
COPY --from=deps /app/node_modules ./node_modules  
COPY . .  

# Generate Prisma Client  
RUN npx prisma generate  

# Build application  
ENV NEXT_TELEMETRY_DISABLED=1   
RUN npm run build  

# Check that the expected output is created  
RUN ls -la .next  

# Production image  
FROM base AS runner  
WORKDIR /app  

ENV NODE_ENV=production  
ENV NEXT_TELEMETRY_DISABLED=1  

RUN addgroup --system --gid 1001 nodejs  
RUN adduser --system --uid 1001 nextjs  

COPY --from=builder /app/public ./public  

# Create .next directory with the correct permissions  
RUN mkdir .next  
RUN chown nextjs:nodejs .next  

# Automatically leverage output traces to reduce image size  
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./  
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static  

USER nextjs  

EXPOSE 3000  

ENV PORT=3000  
ENV HOSTNAME="0.0.0.0"   

CMD ["node", "server.js"]  