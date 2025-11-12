# UrjaFlow - Quick Start Guide

Get UrjaFlow running in 5 minutes! 🚀

## Prerequisites

- Node.js 20+ installed
- npm or yarn

## Quick Setup (SQLite - No Supabase Required)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

The default `.env.example` is configured for SQLite, so you can start immediately!

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with demo data
npm run prisma:seed
```

### 4. Start the Application

Open **3 terminals**:

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - WebSocket Server:**
```bash
node lib/websocket.js
```

**Terminal 3 - IoT Simulator:**
```bash
npm run mock:iot
```

### 5. Open the App

Visit: **http://localhost:3000**

**Demo Login:**
- Email: `demo@urjaflow.com`
- Password: `demo123`

## What You'll See

✅ **Dashboard** - Real-time energy monitoring with live updates
✅ **Plans** - 3 subscription tiers (Basic, Professional, Enterprise)
✅ **Billing** - Invoice management
✅ **Support** - Ticket system with FAQs
✅ **Account** - Profile settings

## Features Working Out of the Box

- ✅ Real-time IoT data streaming via WebSocket
- ✅ Live dashboard with charts and statistics
- ✅ Device management (4 demo devices)
- ✅ Subscription plans
- ✅ Invoice tracking
- ✅ Support ticket system
- ✅ Responsive mobile-friendly UI

## Optional: Enable Stripe Payments

1. Get Stripe test keys from [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

2. Update `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

3. Test with card: `4242 4242 4242 4242`

## Optional: Use Supabase (Production)

See [docs/SUPABASE.md](docs/SUPABASE.md) for full Supabase setup.

Quick version:
1. Create Supabase project
2. Get API keys
3. Update `.env` with Supabase credentials
4. Change `DATABASE_URL` to PostgreSQL connection string
5. Run migrations again

## Troubleshooting

### Port Already in Use

**Problem**: Port 3000 or 3001 already in use

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001
npx kill-port 3001
```

### Prisma Client Not Generated

**Problem**: `@prisma/client` not found

**Solution**:
```bash
npx prisma generate
```

### WebSocket Connection Failed

**Problem**: Dashboard shows "Connecting..." forever

**Solution**:
- Make sure WebSocket server is running (Terminal 2)
- Check if port 3001 is available
- Verify `NEXT_PUBLIC_WS_URL=ws://localhost:3001` in `.env`

### No Data Showing

**Problem**: Dashboard is empty

**Solution**:
```bash
# Re-seed the database
npm run prisma:seed
```

## Development Commands

```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run mock:iot         # Start IoT simulator
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests
```

## Project Structure

```
urjaflow-app/
├── app/                 # Next.js pages
│   ├── page.tsx        # Dashboard
│   ├── plans/          # Subscription plans
│   ├── billing/        # Invoices
│   ├── support/        # Support tickets
│   ├── account/        # User settings
│   └── api/            # API routes ✅ NOW COMPLETE!
├── components/          # React components
├── lib/                 # Utilities
├── prisma/             # Database schema
└── scripts/            # IoT simulator
```

## Next Steps

1. ✅ **Explore the Dashboard** - See real-time energy data
2. ✅ **Check Different Plans** - View subscription options
3. ✅ **Open Prisma Studio** - `npm run prisma:studio` to see database
4. ✅ **Customize** - Modify components and add features
5. ✅ **Deploy** - Use Vercel or Docker for production

## Need Help?

- 📖 **Full Documentation**: See [README.md](README.md)
- 🏗️ **Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 🔧 **Supabase Setup**: See [docs/SUPABASE.md](docs/SUPABASE.md)

## Demo Credentials

After seeding, you have:
- **2 Users**: demo@urjaflow.com, admin@urjaflow.com
- **Password**: demo123
- **4 Devices**: Solar Panel, Battery, Inverter, Meter
- **3 Plans**: Basic ($29.99), Professional ($79.99), Enterprise ($199.99)
- **3 Invoices**: 2 paid, 1 pending
- **2 Support Tickets**: 1 open, 1 resolved

Enjoy building with UrjaFlow! ⚡
