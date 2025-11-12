# UrjaFlow - Energy as a Service Platform

![UrjaFlow](https://img.shields.io/badge/UrjaFlow-EaaS-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green)

A complete, production-ready Energy-as-a-Service (EaaS) platform for monitoring and managing renewable energy systems with real-time IoT data streaming, subscription management, and advanced analytics.

## ✅ Acceptance Checklist

- [x] Frontend renders and connects to backend APIs (no hardcoded MOCK data in production)
- [x] Dashboard receives live updates from mock IoT simulator via WebSocket
- [x] User can view plans and start Stripe Checkout in test mode
- [x] Webhook integration for subscription and invoice management
- [x] Billing page lists invoices with payment functionality
- [x] Support tickets can be created and viewed
- [x] Prisma migrations and seed create demo content
- [x] Docker Compose starts app + DB successfully
- [x] Unit and E2E tests configured and ready
- [x] CI/CD pipeline with GitHub Actions

## 🚀 Features

### Core Functionality
- **Real-time Energy Monitoring**: Live tracking of solar generation, consumption, and battery levels
- **IoT Device Management**: Connect and monitor multiple energy devices
- **Subscription Plans**: Flexible pricing tiers (Basic, Professional, Enterprise)
- **Stripe Integration**: Secure payment processing and subscription management
- **Support System**: Ticket management with priority levels and FAQs
- **User Dashboard**: Comprehensive analytics and insights
- **WebSocket Streaming**: Real-time data updates from IoT devices

### Technical Features
- **Supabase Backend**: Scalable PostgreSQL database with Row Level Security
- **NextAuth**: Secure authentication with multiple providers
- **Prisma ORM**: Type-safe database access
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Testing**: Unit tests (Jest) and E2E tests (Playwright)
- **Docker Support**: Containerized development and deployment
- **CI/CD**: Automated testing and deployment pipelines

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)
- Supabase account (for backend)
- Stripe account (for payments, test mode)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Fetching**: SWR / React Query
- **State Management**: React Hooks + Context API

### Backend
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Real-time**: WebSocket (ws library)
- **API**: Next.js API Routes + Supabase Edge Functions

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Testing**: Jest, Playwright
- **Linting**: ESLint, Prettier
- **Git Hooks**: Husky

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd urjaflow-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (for local development with SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-chars

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WebSocket
WS_PORT=3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with demo data
npm run prisma:seed
```

### 5. Start Development Server

```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Start WebSocket server
node lib/websocket.js

# Terminal 3: Start IoT simulator
npm run mock:iot
```

The application will be available at:
- **App**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

## 🐳 Docker Setup

### Development with Docker Compose

```bash
# Start all services (app, database, redis, websocket)
npm run docker:dev

# Stop all services
npm run docker:down
```

Services:
- **App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **WebSocket**: ws://localhost:3001

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with demo data
npm run prisma:studio    # Open Prisma Studio
npm run mock:iot         # Start IoT device simulator
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests
npm run docker:dev       # Start Docker development environment
```

## 🗂️ Project Structure

```
urjaflow-app/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard page
│   ├── plans/               # Subscription plans
│   ├── billing/             # Billing and invoices
│   ├── support/             # Support tickets
│   ├── account/             # User account settings
│   ├── auth/                # Authentication pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── Icons.tsx            # Icon library
│   ├── Layout.tsx           # Main layout
│   ├── StatCard.tsx         # Statistics card
│   ├── PlanCard.tsx         # Subscription plan card
│   ├── ChartBars.tsx        # Bar chart component
│   ├── Modal.tsx            # Modal component
│   └── Notification.tsx     # Toast notifications
├── lib/                     # Utility libraries
│   ├── prisma.ts            # Prisma client
│   ├── supabase.ts          # Supabase client
│   ├── stripe.ts            # Stripe client
│   ├── utils.ts             # Helper functions
│   └── websocket.ts         # WebSocket server
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema
│   └── seed.ts              # Database seed script
├── scripts/                 # Utility scripts
│   └── mock_iot.ts          # IoT device simulator
├── supabase/                # Supabase Edge Functions
│   └── functions/           # Edge function implementations
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── e2e/                 # E2E tests
├── types/                   # TypeScript type definitions
│   └── index.ts             # Global types
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # System architecture
│   └── DECISIONS.md         # Technical decisions
├── .github/                 # GitHub configuration
│   └── workflows/           # CI/CD workflows
├── docker-compose.dev.yml   # Docker Compose config
├── Dockerfile               # Docker image config
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔐 Authentication

### Demo Credentials

After running the seed script, you can log in with:

- **Email**: demo@urjaflow.com
- **Password**: demo123

Or create a new account via the signup page.

## 💳 Stripe Integration

### Test Mode

The application is configured for Stripe test mode. Use these test cards:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Webhook Setup

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
npm run stripe:webhook
```

## 📊 Database Schema

Key models:
- **User**: User accounts and profiles
- **Plan**: Subscription plans
- **Subscription**: User subscriptions
- **Device**: IoT energy devices
- **DeviceReading**: Real-time sensor data
- **Invoice**: Billing and payments
- **SupportTicket**: Customer support
- **FAQ**: Frequently asked questions

See `prisma/schema.prisma` for full schema.

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker Production

```bash
docker build -t urjaflow .
docker run -p 3000:3000 urjaflow
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Technical Decisions](docs/DECISIONS.md)
- [API Documentation](docs/API.md)
- [Supabase Setup Guide](docs/SUPABASE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Stripe for payment processing
- All open-source contributors

## 📞 Support

For support, email support@urjaflow.com or create an issue in the repository.

---

Built with ❤️ using Next.js, Supabase, and TypeScript
