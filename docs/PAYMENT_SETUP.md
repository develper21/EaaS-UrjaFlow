# Stripe Payment Gateway Setup Guide

## Overview
This document provides complete instructions for setting up and using the Stripe payment gateway integration in UrjaFlow.

## Features Implemented

### ✅ Complete Payment Flow
- **Subscription Management**: Monthly recurring subscriptions with Stripe
- **Secure Checkout**: Stripe Checkout hosted payment pages
- **Payment Methods**: Credit/Debit card support
- **Webhooks**: Real-time payment status updates
- **Invoice Generation**: Automatic invoice creation and tracking
- **Payment History**: Complete billing history for users

### ✅ User Features
- Subscribe to plans (Basic, Professional, Enterprise)
- Secure payment processing via Stripe
- Payment success/cancel pages
- Billing dashboard with invoice history
- Payment method management (coming soon)
- Subscription cancellation

## Setup Instructions

### 1. Get Stripe API Keys

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### 2. Configure Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Stripe Webhooks

Webhooks allow Stripe to notify your app about payment events.

#### For Local Development:

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   npm run stripe:webhook
   # or
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env`

#### For Production:

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add it to your production environment variables

### 4. Test Payment Flow

#### Using Test Cards:

Stripe provides test card numbers for testing:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

- Use any future expiry date (e.g., `12/25`)
- Use any 3-digit CVC (e.g., `123`)
- Use any ZIP code (e.g., `12345`)

#### Test Flow:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Start Stripe webhook forwarding:
   ```bash
   npm run stripe:webhook
   ```

3. Sign in to the app at `http://localhost:3000/auth/signin`

4. Navigate to Plans page: `http://localhost:3000/plans`

5. Click "Subscribe" on any plan

6. You'll be redirected to Stripe Checkout

7. Use test card `4242 4242 4242 4242` to complete payment

8. You'll be redirected to the success page

9. Check your billing page to see the invoice

## API Endpoints

### Subscribe to Plan
```typescript
POST /api/subscribe
Body: { planId: string }
Response: { success: boolean, data: { sessionId: string, url: string } }
```

### Stripe Webhooks
```typescript
POST /api/webhooks/stripe
Headers: { stripe-signature: string }
Body: Stripe Event Object
```

### Get Payment Methods
```typescript
GET /api/billing/payment-method
Response: { success: boolean, data: { paymentMethods: [] } }
```

### Cancel Subscription
```typescript
POST /api/billing/cancel
Response: { success: boolean, message: string }
```

## Payment Flow Diagram

```
User → Plans Page → Click Subscribe
  ↓
Check Authentication
  ↓
Create Checkout Session (API)
  ↓
Redirect to Stripe Checkout
  ↓
User Enters Payment Info
  ↓
Payment Processing
  ↓
Success → /payment/success
Cancel → /payment/cancel
  ↓
Webhook Received
  ↓
Create Subscription & Invoice in DB
  ↓
User Can View in Billing Page
```

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` server-side only
2. **Verify webhook signatures**: Always verify Stripe webhook signatures
3. **Use HTTPS in production**: Stripe requires HTTPS for webhooks
4. **Validate user sessions**: Check authentication before processing payments
5. **Handle errors gracefully**: Provide clear error messages to users

## Troubleshooting

### Webhook Not Receiving Events
- Check if Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook secret in `.env` matches the CLI output
- Check server logs for webhook errors

### Payment Fails
- Verify Stripe keys are correct in `.env`
- Check if using test mode keys with test cards
- Review Stripe Dashboard logs for error details

### Subscription Not Created
- Check webhook is properly configured
- Verify database connection
- Check server logs for errors in webhook handler

## Going to Production

1. **Switch to Live Mode**:
   - Get live API keys from Stripe Dashboard
   - Update `.env` with live keys (remove `_test_` from keys)

2. **Setup Production Webhooks**:
   - Add webhook endpoint in Stripe Dashboard
   - Use your production domain URL
   - Update `STRIPE_WEBHOOK_SECRET` with production secret

3. **Test Thoroughly**:
   - Test with real cards (small amounts)
   - Verify webhook events are received
   - Check subscription and invoice creation

4. **Monitor**:
   - Set up Stripe Dashboard alerts
   - Monitor webhook delivery
   - Track failed payments

## Support

For issues with:
- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **Webhook Issues**: See [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- **Testing**: Use [Stripe Testing Guide](https://stripe.com/docs/testing)

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhook Events](https://stripe.com/docs/api/events/types)
- [Next.js + Stripe Integration](https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe)
