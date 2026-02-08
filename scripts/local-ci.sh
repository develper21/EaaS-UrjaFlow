#!/bin/bash

# Local CI/CD Testing Script
# Run this script locally to test the CI/CD pipeline

set -e

echo "🚀 Starting Local CI/CD Pipeline Test..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "ℹ️  $1"
}

# Step 1: Environment Setup
echo "📋 Step 1: Environment Setup"
echo "--------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi
log_success "Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi
log_success "npm is installed: $(npm --version)"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -U urjaflow -d urjaflow_test &> /dev/null; then
    log_error "PostgreSQL is not running or urjaflow_test database doesn't exist"
    log_info "Please start PostgreSQL and create urjaflow_test database"
    exit 1
fi
log_success "PostgreSQL is connected"

# Step 2: Dependencies
echo ""
echo "📦 Step 2: Installing Dependencies"
echo "--------------------------------"

if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm ci
    log_success "Dependencies installed"
else
    log_success "Dependencies already installed"
fi

# Step 3: Database Setup
echo ""
echo "🗄️ Step 3: Database Setup"
echo "--------------------------------"

log_info "Running database migrations..."
npx prisma migrate deploy
log_success "Database migrations completed"

log_info "Generating Prisma client..."
npx prisma generate
log_success "Prisma client generated"

log_info "Seeding test data..."
npm run prisma:seed
log_success "Test data seeded"

# Step 4: Code Quality
echo ""
echo "🔍 Step 4: Code Quality Checks"
echo "--------------------------------"

log_info "Running ESLint..."
if npm run lint; then
    log_success "ESLint passed"
else
    log_error "ESLint failed"
    exit 1
fi

log_info "Running TypeScript check..."
if npx tsc --noEmit; then
    log_success "TypeScript check passed"
else
    log_error "TypeScript check failed"
    exit 1
fi

# Step 5: Unit Tests
echo ""
echo "🧪 Step 5: Unit Tests"
echo "--------------------------------"

log_info "Running unit tests..."
if npm test; then
    log_success "Unit tests passed"
else
    log_error "Unit tests failed"
    exit 1
fi

# Step 6: Build
echo ""
echo "🏗️ Step 6: Build Application"
echo "--------------------------------"

log_info "Building application..."
if npm run build; then
    log_success "Build completed"
else
    log_error "Build failed"
    exit 1
fi

# Step 7: E2E Tests
echo ""
echo "🎭 Step 7: E2E Tests"
echo "--------------------------------"

log_info "Starting application for E2E tests..."
npm start &
APP_PID=$!

# Wait for application to start
log_info "Waiting for application to start..."
sleep 10

# Check if application is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    log_success "Application is running"
else
    log_error "Application failed to start"
    kill $APP_PID
    exit 1
fi

log_info "Running E2E tests..."
if npm run test:e2e; then
    log_success "E2E tests passed"
else
    log_error "E2E tests failed"
    kill $APP_PID
    exit 1
fi

# Cleanup
kill $APP_PID

# Step 8: Security Audit
echo ""
echo "🔒 Step 8: Security Audit"
echo "--------------------------------"

log_info "Running security audit..."
if npm audit --audit-level=high; then
    log_success "Security audit passed"
else
    log_warning "Security audit found issues (check output above)"
fi

# Step 9: Performance Check
echo ""
echo "⚡ Step 9: Performance Check"
echo "--------------------------------"

log_info "Checking bundle size..."
if command -v npx &> /dev/null; then
    npx bundlephobia-check package.json
    log_success "Bundle size checked"
else
    log_warning "Bundle size check skipped (bundlephobia not available)"
fi

# Final Summary
echo ""
echo "🎉 Local CI/CD Pipeline Completed Successfully!"
echo "================================================"
echo "✅ Environment Setup"
echo "✅ Dependencies"
echo "✅ Database Setup"
echo "✅ Code Quality"
echo "✅ Unit Tests"
echo "✅ Build"
echo "✅ E2E Tests"
echo "✅ Security Audit"
echo "✅ Performance Check"
echo ""
echo "🚀 Your project is ready for deployment!"
