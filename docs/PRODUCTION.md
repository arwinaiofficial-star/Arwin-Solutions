# JobReady.ai Production Deployment Guide

This document provides comprehensive instructions for deploying JobReady.ai to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Security Considerations](#security-considerations)
5. [Monitoring & Logging](#monitoring--logging)
6. [Scaling Considerations](#scaling-considerations)
7. [Production Checklist](#production-checklist)

---

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 9+ or yarn/pnpm
- Git
- Domain configured with SSL certificate

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure required variables:**
   ```env
   NEXT_PUBLIC_BASE_URL=https://jobready.ai
   NODE_ENV=production
   LOG_LEVEL=info
   RATE_LIMIT_REQUESTS_PER_MINUTE=60
   ```

3. **Build the application:**
   ```bash
   npm install
   npm run build
   ```

4. **Start production server:**
   ```bash
   npm run start
   ```

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments.

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t jobready-ai .
docker run -p 3000:3000 jobready-ai
```

### Option 3: Traditional Server (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "jobready" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## Security Considerations

### Current Demo Limitations

⚠️ **Important:** The current authentication uses localStorage for demonstration purposes. For production:

1. **Implement server-side authentication:**
   - Use NextAuth.js, Clerk, or Auth0
   - Never store passwords in localStorage
   - Use secure, HTTP-only cookies for sessions

2. **Database integration:**
   - Replace localStorage with PostgreSQL/MongoDB
   - Use an ORM like Prisma or Drizzle
   - Implement proper password hashing (bcrypt)

### Security Headers

The application includes these security headers (configured in `next.config.ts`):

- `Strict-Transport-Security` - Forces HTTPS
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-Frame-Options` - Prevents clickjacking
- `X-XSS-Protection` - Basic XSS protection
- `Referrer-Policy` - Controls referrer information

### Rate Limiting

API endpoints include rate limiting:
- Default: 60 requests per minute per IP
- Configure via `RATE_LIMIT_REQUESTS_PER_MINUTE`
- For distributed deployments, use Redis-based rate limiting

---

## Monitoring & Logging

### Logging

The application uses structured logging:

```typescript
import logger from "@/lib/logger";

logger.info("User action", { userId: "123", action: "signup" });
logger.error("API error", { endpoint: "/api/jobs", error: error.message });
```

Log levels (configure via `LOG_LEVEL`):
- `debug` - Detailed debugging
- `info` - General information
- `warn` - Warnings
- `error` - Errors only

### Health Check

Monitor application health:

```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Recommended Tools

- **Error Tracking:** Sentry
- **Application Monitoring:** Datadog, New Relic
- **Log Aggregation:** Logtail, Papertrail
- **Uptime Monitoring:** Better Stack, UptimeRobot

---

## Scaling Considerations

### Horizontal Scaling

1. **Session Storage:**
   - Move from localStorage to Redis/database
   - Use sticky sessions or distributed sessions

2. **Rate Limiting:**
   - Implement Redis-based rate limiting
   - Share rate limit state across instances

3. **Caching:**
   - Use Redis for caching job search results
   - Implement CDN for static assets

### Database Recommendations

For production, implement:

```sql
-- Example PostgreSQL schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  job_id VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted',
  applied_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  cv_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Production Checklist

Before going live, ensure:

### Security
- [ ] Replace localStorage auth with proper authentication
- [ ] Implement password hashing (bcrypt)
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Configure Content Security Policy
- [ ] Review and test rate limiting

### Performance
- [ ] Run production build (`npm run build`)
- [ ] Enable gzip/brotli compression
- [ ] Configure CDN for static assets
- [ ] Test load handling

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure health check monitoring
- [ ] Set up log aggregation
- [ ] Create alerting rules

### Database
- [ ] Set up production database
- [ ] Implement proper data migrations
- [ ] Configure automated backups
- [ ] Set up connection pooling

### Compliance
- [ ] Add Privacy Policy page
- [ ] Add Terms of Service page
- [ ] Implement cookie consent (if required)
- [ ] Ensure GDPR/data protection compliance

### Testing
- [ ] Run all tests (`npm test`)
- [ ] Perform security audit
- [ ] Load test API endpoints
- [ ] Test across browsers/devices

---

## Support

For deployment assistance or questions, contact the Arwin AI Solutions team.

**Repository:** https://github.com/arwinaiofficial-star/Arwin-Solutions
