# UrjaFlow Architecture Documentation

## System Overview

UrjaFlow is a full-stack Energy-as-a-Service (EaaS) platform built with modern web technologies. The system follows a microservices-inspired architecture with clear separation between frontend, backend, database, and real-time services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   Desktop    │          │
│  │  (Next.js)   │  │   (Future)   │  │   (Future)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│                            │                                      │
│  ┌─────────────────────────┴──────────────────────────┐          │
│  │           Next.js Application Server                │          │
│  │  ┌──────────────┐  ┌──────────────┐               │          │
│  │  │  App Router  │  │  API Routes  │               │          │
│  │  │   (Pages)    │  │  (Endpoints) │               │          │
│  │  └──────────────┘  └──────────────┘               │          │
│  └────────────┬────────────────┬──────────────────────┘          │
│               │                │                                  │
│  ┌────────────┴────────┐  ┌───┴──────────────┐                  │
│  │  NextAuth.js        │  │  Stripe SDK      │                  │
│  │  (Authentication)   │  │  (Payments)      │                  │
│  └─────────────────────┘  └──────────────────┘                  │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                      BACKEND SERVICES                             │
│                            │                                      │
│  ┌─────────────────────────┴──────────────────────────┐          │
│  │              Supabase Platform                      │          │
│  │  ┌──────────────┐  ┌──────────────┐               │          │
│  │  │  PostgreSQL  │  │ Edge Funcs   │               │          │
│  │  │  (Database)  │  │ (Serverless) │               │          │
│  │  └──────────────┘  └──────────────┘               │          │
│  │  ┌──────────────┐  ┌──────────────┐               │          │
│  │  │  Auth        │  │  Storage     │               │          │
│  │  │  (RLS)       │  │  (Files)     │               │          │
│  │  └──────────────┘  └──────────────┘               │          │
│  └─────────────────────────────────────────────────────          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐         │
│  │         WebSocket Server (Real-time IoT)            │         │
│  │  ┌──────────────┐  ┌──────────────┐               │         │
│  │  │  WS Handler  │  │  Broadcast   │               │         │
│  │  │  (ws lib)    │  │  Manager     │               │         │
│  │  └──────────────┘  └──────────────┘               │         │
│  └─────────────────────────────────────────────────────          │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                       DATA LAYER                                  │
│                            │                                      │
│  ┌─────────────────────────┴──────────────────────────┐          │
│  │              Prisma ORM                             │          │
│  │  ┌──────────────┐  ┌──────────────┐               │          │
│  │  │   Schema     │  │  Migrations  │               │          │
│  │  │   Models     │  │   & Seeds    │               │          │
│  │  └──────────────┘  └──────────────┘               │          │
│  └─────────────────────────────────────────────────────          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐         │
│  │         PostgreSQL Database (Supabase)              │         │
│  │  ┌──────────────┐  ┌──────────────┐               │         │
│  │  │    Tables    │  │     RLS      │               │         │
│  │  │   Indexes    │  │   Policies   │               │         │
│  │  └──────────────┘  └──────────────┘               │         │
│  └─────────────────────────────────────────────────────          │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│                            │                                      │
│  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────┐          │
│  │   Stripe     │  │  SMTP/Email  │  │  IoT Devices │          │
│  │  (Payments)  │  │  (Nodemailer)│  │  (Simulated) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend (Next.js App Router)

**Technology**: Next.js 16, React 19, TypeScript, Tailwind CSS

**Key Components**:
- **Pages**: Dashboard, Plans, Billing, Support, Account, Auth
- **Layout**: Responsive sidebar navigation with mobile support
- **Components**: Reusable UI components (StatCard, PlanCard, Charts, Modal)
- **State Management**: React Hooks + Context API for notifications
- **Data Fetching**: SWR for client-side data fetching with caching

**Routing**:
```
/ (Dashboard)
/plans (Subscription Plans)
/billing (Invoices & Payments)
/support (Tickets & FAQs)
/account (Profile Settings)
/auth/signin (Login)
/auth/signup (Registration)
```

### 2. Backend API (Next.js API Routes + Supabase)

**API Endpoints**:

```typescript
// Dashboard & Analytics
GET  /api/dashboard          // Aggregated stats and history
GET  /api/devices            // List user devices
GET  /api/devices/:id        // Device details
POST /api/readings           // Store device reading

// Subscription Management
GET  /api/plans              // List available plans
POST /api/subscribe          // Create subscription (Stripe)
GET  /api/subscription       // Current subscription

// Billing
GET  /api/billing            // Invoices list
POST /api/billing/pay        // Pay invoice
GET  /api/payment-methods    // Payment methods

// Support
GET  /api/support/faqs       // FAQ list
POST /api/support/ticket     // Create ticket
GET  /api/support/tickets    // User tickets

// Webhooks
POST /api/webhooks/stripe    // Stripe webhook handler

// Real-time
WS   ws://localhost:3001     // WebSocket for IoT data
```

### 3. Database Schema (Prisma + PostgreSQL)

**Core Models**:

```prisma
User
├── id, email, name, password, role
├── subscriptions[]
├── devices[]
├── invoices[]
└── tickets[]

Plan
├── id, name, price, features
└── subscriptions[]

Subscription
├── id, userId, planId, status
├── stripeSubscriptionId
└── currentPeriodStart/End

Device
├── id, userId, name, type, capacity
├── status, location
└── readings[]

DeviceReading
├── id, deviceId, timestamp
├── generationKW, consumptionKW
└── batteryPercent, voltage, etc.

Invoice
├── id, userId, subscriptionId
├── amount, status, dueDate
└── stripeInvoiceId

SupportTicket
├── id, userId, subject, description
└── status, priority, category

FAQ
└── id, question, answer, category
```

### 4. Real-time System (WebSocket)

**Flow**:
1. IoT Simulator generates device readings every 3 seconds
2. Readings sent to WebSocket server via WS connection
3. Server broadcasts to all connected clients
4. Dashboard updates UI in real-time

**Message Format**:
```typescript
{
  type: 'reading',
  deviceId: 'device-1',
  data: {
    timestamp: Date,
    generationKW: number,
    consumptionKW: number,
    batteryPercent: number,
    voltage: number,
    current: number,
    temperature: number,
    efficiency: number
  }
}
```

### 5. Authentication Flow (NextAuth.js)

**Providers**:
- Credentials (email/password)
- Email Magic Link
- OAuth (Google, GitHub) - ready for integration

**Session Management**:
- JWT tokens stored in HTTP-only cookies
- Server-side session validation
- Automatic token refresh

**Flow**:
```
1. User submits credentials
2. NextAuth validates against database
3. JWT token generated and stored
4. Protected routes check session
5. Unauthorized users redirected to /auth/signin
```

### 6. Payment Flow (Stripe)

**Subscription Creation**:
```
1. User selects plan
2. POST /api/subscribe creates Stripe Checkout Session
3. User redirected to Stripe hosted checkout
4. Payment processed by Stripe
5. Webhook received at /api/webhooks/stripe
6. Subscription & Invoice created in database
7. User redirected to success page
```

**Webhook Events**:
- `checkout.session.completed`: Create subscription
- `invoice.payment_succeeded`: Mark invoice as paid
- `customer.subscription.updated`: Update subscription status
- `customer.subscription.deleted`: Cancel subscription

### 7. Supabase Integration

**Features Used**:
- **PostgreSQL**: Primary database with Row Level Security
- **Auth**: User authentication and authorization
- **Edge Functions**: Serverless API endpoints (optional)
- **Storage**: File uploads (future feature)
- **Realtime**: Database change subscriptions (alternative to WebSocket)

**Row Level Security (RLS)**:
```sql
-- Users can only see their own data
CREATE POLICY user_isolation ON devices
  FOR ALL USING (auth.uid() = user_id);

-- Admins can see everything
CREATE POLICY admin_access ON devices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
```

## Data Flow Examples

### Dashboard Load
```
1. User navigates to /
2. Layout component renders with navigation
3. Dashboard page fetches data via SWR
4. GET /api/dashboard returns aggregated stats
5. Prisma queries database for user devices & readings
6. Data transformed and returned as JSON
7. UI updates with stats, charts, and device list
8. WebSocket connection established for real-time updates
```

### Real-time Update
```
1. IoT simulator generates reading
2. Reading sent to WebSocket server
3. Server broadcasts to all connected clients
4. Dashboard receives message
5. State updated with new reading
6. UI re-renders with updated values
7. Charts and stats reflect new data
```

### Subscription Purchase
```
1. User clicks "Subscribe" on plan
2. POST /api/subscribe with planId
3. Stripe Checkout Session created
4. User redirected to Stripe
5. User completes payment
6. Stripe sends webhook to /api/webhooks/stripe
7. Webhook handler verifies signature
8. Subscription created in database
9. Invoice generated and marked as paid
10. User redirected to /billing
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with short expiration
- HTTP-only cookies prevent XSS
- CSRF protection enabled

### Authorization
- Row Level Security in Supabase
- API routes check user permissions
- Admin-only endpoints protected
- Rate limiting on sensitive endpoints

### Data Protection
- Environment variables for secrets
- Stripe webhook signature verification
- SQL injection prevention via Prisma
- XSS protection via React escaping

### API Security
- CORS configured for allowed origins
- Request validation with Zod
- Error messages sanitized
- Sensitive data excluded from responses

## Performance Optimizations

### Frontend
- Server-side rendering for initial load
- Static generation for public pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- SWR caching and revalidation

### Backend
- Database indexes on frequently queried fields
- Connection pooling with Prisma
- Query optimization and N+1 prevention
- Caching with Redis (optional)

### Real-time
- WebSocket connection reuse
- Message batching for high-frequency updates
- Client-side throttling and debouncing

## Scalability

### Horizontal Scaling
- Stateless API design
- Load balancer distribution
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Database connection pooling
- Worker threads for CPU-intensive tasks
- Caching layer (Redis)
- Queue system for background jobs

## Monitoring & Observability

### Logging
- Structured logging with Winston
- Error tracking with Sentry (future)
- Request/response logging
- Performance metrics

### Metrics
- API response times
- Database query performance
- WebSocket connection count
- Error rates and types

## Deployment Architecture

### Development
```
Local Machine
├── Next.js Dev Server (port 3000)
├── WebSocket Server (port 3001)
├── PostgreSQL (Docker or SQLite)
└── Stripe CLI (webhook forwarding)
```

### Production
```
Vercel
├── Next.js App (serverless functions)
├── Edge Functions (global CDN)
└── Environment Variables

Supabase
├── PostgreSQL (managed)
├── Auth Service
├── Storage
└── Edge Functions

External
├── Stripe (payments)
├── SMTP (emails)
└── Monitoring (Sentry, etc.)
```

## Future Enhancements

1. **Mobile Apps**: React Native for iOS/Android
2. **Advanced Analytics**: ML-based predictions
3. **Multi-tenancy**: Organization support
4. **API Gateway**: GraphQL or tRPC
5. **Caching**: Redis for session and data
6. **Queue System**: Bull/BullMQ for background jobs
7. **Notifications**: Push notifications via FCM
8. **Internationalization**: Multi-language support
9. **White-labeling**: Custom branding per organization
10. **Advanced RLS**: Fine-grained permissions

## Technology Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed rationale behind technology choices.
