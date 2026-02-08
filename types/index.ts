// Type definitions for UrjaFlow application

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  maxDevices: number;
  maxStorage: number;
  priority: number;
  stripePriceId: string | null;
  active: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: Plan;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE';
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: 'SOLAR_PANEL' | 'WIND_TURBINE' | 'BATTERY' | 'INVERTER' | 'METER';
  model: string | null;
  serialNumber: string | null;
  capacity: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR';
  location: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  installedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  generationKW: number | null;
  consumptionKW: number | null;
  batteryPercent: number | null;
  voltage: number | null;
  current: number | null;
  temperature: number | null;
  efficiency: number | null;
  metadata: Record<string, unknown> | null;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED' | 'REFUNDED';
  dueDate: Date;
  paidAt: Date | null;
  stripeInvoiceId: string | null;
  description: string | null;
  metadata: {
    items: Array<{
      description: string;
      amount: number;
    }>;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string | null;
  assignedTo: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
  read: boolean;
  link: string | null;
  createdAt: Date;
}

// Dashboard data types
export interface DashboardStats {
  liveGeneration: number;
  liveConsumption: number;
  batteryLevel: number;
  monthlySavings: number;
  carbonSaved: number;
  generationHistory: Array<{
    date: string;
    generation: number;
    consumption: number;
  }>;
  devices: Device[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Realtime WebSocket message types
export interface RealtimeMessage {
  type: 'reading' | 'alert' | 'status';
  deviceId?: string;
  data: unknown;
  timestamp: Date;
}

// Stripe types
export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}
